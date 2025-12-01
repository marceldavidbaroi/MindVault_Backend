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
import { AccountsService } from 'src/finance/accounts/services/accounts.service';

@Injectable()
export class LedgerService {
  constructor(
    @InjectRepository(AccountLedger)
    private ledgerRepo: Repository<AccountLedger>,

    @InjectRepository(Account)
    private accountRepo: Repository<Account>,
    private readonly accountService: AccountsService,

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
    const repo = manager
      ? manager.getRepository(AccountLedger)
      : this.ledgerRepo;

    const {
      accountId,
      creatorId,
      entryType,
      amount,
      description,
      transactionId,
    } = dto;

    let safeTransactionId: number | null = null;
    if (transactionId) {
      const exists = await this.transactionRepo.findOne({
        where: { id: transactionId },
      });
      safeTransactionId = exists ? transactionId : null; // prevent FK violation
    }

    const newBalance = await this.accountService.getBalance(accountId);

    const ledger = repo.create({
      accountId,
      creatorId,
      transactionId: safeTransactionId,
      entryType,
      amount,
      balanceAfter: newBalance,
      description,
    });

    const saved = await repo.save(ledger);

    return { success: true, message: 'Ledger entry created', data: saved };
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
    if (!tx)
      return this.createEntry(
        {
          accountId: 0, // optional, or skip entirely
          creatorId: null,
          entryType: 'expense', // fallback type
          amount: '0',
          description: `Deleted transaction #${transactionId}`,
          transactionId: null,
        },
        manager,
      );

    return this.createEntry(
      {
        accountId: tx.account.id,
        creatorId: tx.creatorUser?.id ?? null,
        entryType: tx.type,
        amount: tx.amount,
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
}
