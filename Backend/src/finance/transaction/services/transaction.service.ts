// services/transaction.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Transaction } from '../entity/transaction.entity';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { TransactionRepository } from '../repository/transaction.repository';
import { TransactionTransformer } from '../transformers/transaction.transformer';
import { TransactionLedger } from '../entity/transaction-ledger.entity';
import { TransactionLedgerService } from './transaction-ledger.service';
import { DataSource } from 'typeorm/browser';
import { UserValidator } from 'src/auth/validator/user.validator';
import { AccountsService } from 'src/finance/accounts/services/accounts.service';
import { BalanceAction } from 'src/finance/accounts/dto/update-balance.dto';
import { TransactionAuditLogService } from './transaction-audit-log.service';
import {TransactionAuditAction} from '../entity/transaction-audit-log.entity.ts'

@Injectable()
export class TransactionService {
  constructor(
    private readonly repository: TransactionRepository,
    private readonly transformer: TransactionTransformer,
    private readonly transactionLedgerService: TransactionLedgerService,
    private readonly dataSource: DataSource,
    private readonly userValidator: UserValidator,
    private readonly accountsService: AccountsService,
    private readonly transactionAuditLogService: TransactionAuditLogService,
  ) {}

  async create(dto: CreateTransactionDto, creatorId: number) {
    const creator = await this.userValidator.ensureUserExists(creatorId);

    // Start a transaction internally
    return await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Transaction);

      // 1️⃣ Create the transaction
      const transaction = await repo.save(
        repo.create({
          ...dto,
          creatorId,
        }),
      );
      const newBalance = await this.accountsService.updateBalance(
        manager,
        dto.accountId,
        creator,
        { action: BalanceAction.ADD, amount: transaction.amount },
        'Transaction Create Service',
      );

      // 2️⃣ Create the ledger entry atomically
      await this.transactionLedgerService.create(manager, {
        accountId: transaction.accountId,
        transactionId: transaction.id,
        transactionSnapshot: transaction,
        creatorId: creatorId,
        creatorSnapshot: { username: creator.username, email: creator.email },
        entryType: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        balanceAfter: newBalance, // ⚠️ placeholder, implement balance calculation
      });

      await this.transactionAuditLogService.create(manager,{
        transactionId:transaction.id,
        actorId:create.id,
        actorSnapshot:{ username: creator.username, email: creator.email },
action:TransactionAuditAction.

      });

      /**
       * 🔌 EXTENSION POINTS (CREATE)
       * -----------------------------------
       * - Create Transaction Audit Log
       * - Trigger notifications / webhooks
       */

      return {
        success: true,
        message: 'Transaction and ledger entry created atomically',
        data: this.transformer.transform(transaction),
      };
    });
  }

  async update(manager: EntityManager, id: number, dto: UpdateTransactionDto) {
    const repo = manager.getRepository(Transaction);

    const transaction = await repo.findOne({ where: { id } });
    if (!transaction) throw new NotFoundException('Transaction not found');

    Object.assign(transaction, dto);
    await repo.save(transaction);

    /**
     * 🔌 EXTENSION POINTS (UPDATE)
     * -----------------------------------
     * - Reverse & recreate ledger entries
     * - Create audit log (before / after)
     */

    return {
      success: true,
      message: 'Transaction updated',
      data: this.transformer.transform(transaction),
    };
  }

  async delete(manager: EntityManager, id: number) {
    const repo = manager.getRepository(Transaction);

    const transaction = await repo.findOne({ where: { id } });
    if (!transaction) throw new NotFoundException('Transaction not found');

    await repo.remove(transaction);

    /**
     * 🔌 EXTENSION POINTS (DELETE)
     * -----------------------------------
     * - Void transaction ledger entries
     * - Create audit log with reason
     */

    return {
      success: true,
      message: 'Transaction deleted',
    };
  }

  async list(query) {
    const result = await this.repository.list(query);

    return {
      success: true,
      message: 'Transactions retrieved',
      data: this.transformer.transformMany(result.data),
      meta: result,
    };
  }
}
