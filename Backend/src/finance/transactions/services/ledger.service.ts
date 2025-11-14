import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { AccountLedger } from '../entities/ledger.entity';
import { Account } from 'src/finance/accounts/entity/account.entity';
import { Transaction } from '../entities/transaction.entity';
import { User } from 'src/auth/entities/user.entity';
import { CreateLedgerEntryDto } from '../dto/create-ledger-entry.dto';

@Injectable()
export class LedgerService {
  constructor(
    @InjectRepository(AccountLedger)
    private ledgerRepo: Repository<AccountLedger>,

    @InjectRepository(Account)
    private accountRepo: Repository<Account>,

    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,

    private dataSource: DataSource,
  ) {}

  /**
   * Create a ledger entry (transaction-safe)
   * @param dto CreateLedgerEntryDto
   * @param manager optional EntityManager for transactional operations
   */
  async createEntry(dto: CreateLedgerEntryDto, manager?: EntityManager) {
    const repo = manager || this.ledgerRepo.manager;
    const accountRepository = manager
      ? manager.getRepository(Account)
      : this.accountRepo;
    const transactionRepository = manager
      ? manager.getRepository(Transaction)
      : this.transactionRepo;
    const userRepository = manager
      ? manager.getRepository(User)
      : this.dataSource.getRepository(User);

    const {
      accountId,
      creatorId,
      entryType,
      amount,
      description,
      transactionId,
    } = dto;

    // Validate account
    const account = await accountRepository.findOne({
      where: { id: accountId },
    });
    if (!account) throw new NotFoundException('Account not found');

    // Validate user
    const creator = await userRepository.findOne({ where: { id: creatorId } });
    if (!creator) throw new NotFoundException('User not found');

    if (amount <= 0)
      throw new BadRequestException('Amount must be a positive number');

    // Validate transaction if provided
    if (transactionId) {
      const tx = await transactionRepository.findOne({
        where: { id: transactionId },
      });
      if (!tx) throw new NotFoundException('Transaction not found');
    }

    // Calculate new balance
    const currentBalance = Number(account.balance);
    const newBalance =
      entryType === 'income'
        ? currentBalance + amount
        : currentBalance - amount;

    if (newBalance < 0)
      throw new BadRequestException('Account balance cannot go negative');

    // Update account balance
    account.balance = newBalance.toFixed(2);
    await accountRepository.save(account);

    // Create ledger entry
    const ledger = repo.create(AccountLedger, {
      accountId,
      creatorId,
      entryType,
      amount: amount.toFixed(2),
      balanceAfter: newBalance.toFixed(2),
      description,
      transactionId: transactionId ?? null,
    });

    const saved = await repo.save(ledger);

    return {
      success: true,
      message: 'Ledger entry created successfully',
      data: saved,
    };
  }

  /**
   * Create a ledger entry from a transaction
   */
  async createFromTransaction(transactionId: number, manager?: EntityManager) {
    const repo = manager || this.transactionRepo.manager;
    const tx = await repo.findOne(Transaction, {
      where: { id: transactionId },
      relations: ['account', 'creatorUser'],
    });
    if (!tx) throw new NotFoundException('Transaction not found');

    return this.createEntry(
      {
        accountId: tx.account.id,
        creatorId: tx.creatorUser.id,
        entryType: tx.type,
        amount: Number(tx.amount),
        description: tx.description,
        transactionId: tx.id,
      },
      manager,
    );
  }

  /**
   * Get all ledger entries for an account
   */
  async getAccountLedger(accountId: number) {
    const entries = await this.ledgerRepo.find({
      where: { accountId },
      order: { createdAt: 'ASC' },
    });

    return {
      success: true,
      message: 'OK',
      data: entries,
    };
  }

  /**
   * Get a single ledger entry by ID
   */
  async getById(id: number) {
    const entry = await this.ledgerRepo.findOne({ where: { id } });
    if (!entry) throw new NotFoundException('Ledger entry not found');

    return {
      success: true,
      message: 'OK',
      data: entry,
    };
  }

  /**
   * Delete a ledger entry
   */
  async delete(id: number) {
    const entry = await this.ledgerRepo.findOne({ where: { id } });
    if (!entry) throw new NotFoundException('Ledger entry not found');

    await this.ledgerRepo.delete(id);

    return {
      success: true,
      message: 'Ledger entry deleted',
      data: null,
    };
  }
}
