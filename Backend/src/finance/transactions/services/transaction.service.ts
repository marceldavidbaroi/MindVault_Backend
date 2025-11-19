import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { User } from 'src/auth/entities/user.entity';
import { VerifyUserService } from 'src/auth/services/verify-user.service';
import { CurrencyService } from 'src/finance/currency/services/currency.service';
import { CategoriesService } from 'src/finance/categories/categories.service';
import { AccountsService } from 'src/finance/accounts/services/accounts.service';
import { AccountUserRolesService } from 'src/finance/accounts/services/account-user-roles.service.service';
import { ListTransactionsFilterDto } from '../dto/list-transactions.dto';
import { SummaryWorkerService } from 'src/finance/summary/services/summary-worker.service';
import { LedgerService } from './ledger.service';
import { safeAdd, safeSubtract } from 'src/common/utils/decimal-balance';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    private readonly verifyUserService: VerifyUserService,
    private readonly currencyService: CurrencyService,
    private readonly categoryService: CategoriesService,
    private readonly dataSource: DataSource,
    private readonly accountUserRolesService: AccountUserRolesService,
    private readonly summaryWorkerService: SummaryWorkerService,
    private readonly accountService: AccountsService,
    private readonly ledgerService: LedgerService,
  ) {}

  // ----------------------------------------------------------
  // CREATE TRANSACTION
  // ----------------------------------------------------------

  async createTransaction(userId: number, dto: CreateTransactionDto) {
    return await this.dataSource.transaction(async (manager) => {
      const user: User = await this.verifyUserService.verify(userId);

      const account = await this.accountUserRolesService.getUserRoleForAccount(
        userId,
        dto.accountId,
      );

      const category = dto.categoryId
        ? await this.categoryService.verifyCategory(dto.categoryId)
        : undefined;

      const currency = dto.currencyCode
        ? await this.currencyService.verifyCurrency(dto.currencyCode)
        : undefined;

      if (dto.externalRefId) {
        const existing = await manager.findOne(Transaction, {
          where: { externalRefId: dto.externalRefId },
        });
        if (existing)
          throw new BadRequestException('externalRefId must be unique');
      }

      const tx = this.transactionRepo.create({
        account,
        creatorUser: user,
        category,
        type: dto.type,
        amount: dto.amount,
        currency,
        transactionDate: dto.transactionDate,
        description: dto.description,
        status: dto.status ?? 'pending',
        externalRefId: dto.externalRefId,
        recurring: dto.recurring ?? false,
        recurringInterval: dto.recurringInterval,
      });

      const savedTx = await manager.save(tx);

      // UPDATE ACCOUNT BALANCE
      const currentBalance = await this.accountService.getBalance(
        dto.accountId,
      );
      // const amount = Number(dto.amount);
      const balance =
        dto.type === 'income'
          ? safeAdd(currentBalance, dto.amount)
          : safeSubtract(currentBalance, dto.amount);

      console.log('balance', balance);

      const res = await this.accountService.updateBalance(
        dto.accountId,
        balance,
      );
      console.log('res', res.balance);

      // UPDATE SUMMARY TABLES
      await this.summaryWorkerService.handleTransaction(savedTx);

      // LEDGER
      await this.ledgerService.createEntry(
        {
          accountId: account.id,
          creatorId: user.id,
          entryType: dto.type,
          amount: dto.amount,
          description: dto.description ?? `Transaction #${savedTx.id} created`,
          transactionId: savedTx.id,
        },
        manager,
      );

      return { success: true, message: 'Transaction created', data: savedTx };
    });
  }

  // ----------------------------------------------------------
  // GET SINGLE TRANSACTION
  // ----------------------------------------------------------

  async getTransaction(id: number) {
    const tx = await this.transactionRepo.findOne({ where: { id } });
    if (!tx) return { success: false, message: 'Transaction not found' };
    return { success: true, message: 'OK', data: tx };
  }

  // ----------------------------------------------------------
  // LIST TRANSACTIONS
  // ----------------------------------------------------------
  async listTransactions(
    accountId: number,
    filters: ListTransactionsFilterDto,
  ) {
    const qb = this.transactionRepo
      .createQueryBuilder('t')
      .leftJoin('t.account', 'account')
      .leftJoin('t.creatorUser', 'creator')
      .leftJoin('t.category', 'category')
      .leftJoin('t.currency', 'currency')
      .select([
        't.id',
        't.type',
        't.amount',
        't.transactionDate',
        't.description',
        't.status',
        't.recurring',
        't.recurringInterval',
        't.externalRefId',
        't.createdAt',
        't.updatedAt', // include this
        'account.id',
        'account.name',
        'category.id',
        'category.name',
        'currency.code',
        'currency.symbol',
        'creator.id',
        'creator.username',
      ])
      .where('account.id = :accountId', { accountId });

    // filters
    if (filters.categoryId)
      qb.andWhere('category.id = :categoryId', {
        categoryId: filters.categoryId,
      });
    if (filters.type) qb.andWhere('t.type = :type', { type: filters.type });
    if (filters.status)
      qb.andWhere('t.status = :status', { status: filters.status });
    if (filters.creatorUserId)
      qb.andWhere('creator.id = :creatorUserId', {
        creatorUserId: filters.creatorUserId,
      });
    if (filters.from)
      qb.andWhere('t.transactionDate >= :from', { from: filters.from });
    if (filters.to) qb.andWhere('t.transactionDate <= :to', { to: filters.to });

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;

    // 👉 Sorting whitelist
    const allowedSortColumns: Record<string, string> = {
      transactionDate: 't.transactionDate',
      createdAt: 't.createdAt',
      updatedAt: 't.updatedAt',
      amount: 't.amount',
      type: 't.type',
      status: 't.status',
    };

    const sortBy =
      filters.sortBy && allowedSortColumns[filters.sortBy]
        ? allowedSortColumns[filters.sortBy]
        : 't.transactionDate';

    const sortOrder = filters.sortOrder ?? 'DESC';

    qb.orderBy(sortBy, sortOrder)
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [items, total] = await qb.getManyAndCount();

    const formatted = items.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      transactionDate: t.transactionDate,
      description: t.description,
      status: t.status,
      recurring: t.recurring,
      recurringInterval: t.recurringInterval,
      externalRefId: t.externalRefId,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      account: t.account ? { id: t.account.id, name: t.account.name } : null,
      category: t.category
        ? { id: t.category.id, name: t.category.name }
        : null,
      currency: t.currency
        ? { symbol: t.currency.symbol, code: t.currency.code }
        : null,
      creatorUser: t.creatorUser
        ? { id: t.creatorUser.id, username: t.creatorUser.username }
        : null,
    }));

    return {
      success: true,
      message: 'OK',
      data: { items: formatted, total, page, pageSize },
    };
  }

  // ----------------------------------------------------------
  // UPDATE TRANSACTION + SUMMARY UPDATE
  // ----------------------------------------------------------

  async updateTransaction(id: number, dto: UpdateTransactionDto) {
    return await this.dataSource.transaction(async (manager) => {
      const tx = await manager.findOne(Transaction, {
        where: { id },
        relations: ['account', 'currency', 'creatorUser', 'category'],
      });

      if (!tx) return { success: false, message: 'Transaction not found' };

      const oldTx = { ...tx };
      let ledgerNeeded = false;

      const oldAmount = Number(tx.amount);
      const oldType = tx.type;
      const oldAccountId = tx.account.id;

      // BALANCE RECALCULATION
      if (
        (dto.amount && dto.amount !== tx.amount) ||
        (dto.type && dto.type !== tx.type)
      ) {
        ledgerNeeded = true;

        const balance = Number(
          await this.accountService.getBalance(oldAccountId),
        );

        // revert old amount
        let newBalance =
          oldType === 'income' ? balance - oldAmount : balance + oldAmount;

        // apply new amount
        const newAmount = Number(dto.amount ?? tx.amount);
        const newType = dto.type ?? tx.type;

        newBalance =
          newType === 'income'
            ? newBalance + newAmount
            : newBalance - newAmount;

        await this.accountService.updateBalance(
          oldAccountId,
          newBalance.toFixed(2),
        );
      }

      // EXTERNAL REF CHECK
      if (dto.externalRefId && dto.externalRefId !== tx.externalRefId) {
        const exists = await manager.findOne(Transaction, {
          where: { externalRefId: dto.externalRefId },
        });
        if (exists && exists.id !== id)
          throw new BadRequestException('externalRefId already exists');
        tx.externalRefId = dto.externalRefId;
      }

      // SIMPLE FIELD UPDATE
      const allowed = [
        'amount',
        'type',
        'description',
        'transactionDate',
        'status',
        'recurring',
        'recurringInterval',
      ];
      allowed.forEach((f) => {
        if (dto[f] !== undefined) tx[f] = dto[f];
      });

      // RELATIONS
      if (dto.accountId) tx.account = { id: dto.accountId } as any;
      if (dto.categoryId) tx.category = { id: dto.categoryId } as any;
      if (dto.currencyCode) tx.currency = { code: dto.currencyCode } as any;

      const updated = await manager.save(tx);

      // UPDATE SUMMARY TABLES
      await this.summaryWorkerService.handleTransactionUpdate(oldTx, updated);

      // LEDGER ENTRY IF AMOUNT/TYPE CHANGED
      if (ledgerNeeded) {
        await this.ledgerService.createEntry(
          {
            accountId: updated.account.id,
            creatorId: updated.creatorUser.id,
            entryType: updated.type,
            amount: updated.amount,
            description:
              dto.description ?? `Transaction #${updated.id} updated`,
            transactionId: updated.id,
          },
          manager,
        );
      }

      return { success: true, message: 'Transaction updated', data: updated };
    });
  }

  // ----------------------------------------------------------
  // DELETE TRANSACTION + SUMMARY DELETE
  // ----------------------------------------------------------

  async deleteTransaction(id: number) {
    return await this.dataSource.transaction(async (manager) => {
      const tx = await manager.findOne(Transaction, {
        where: { id },
        relations: ['account', 'creatorUser'],
      });

      if (!tx) return { success: false, message: 'Transaction not found' };

      const oldAmount = Number(tx.amount);
      const oldType = tx.type;

      const balance = Number(
        await this.accountService.getBalance(tx.account.id),
      );

      // restore balance (reverse transaction)
      const newBalance =
        oldType === 'income' ? balance - oldAmount : balance + oldAmount;

      await this.accountService.updateBalance(
        tx.account.id,
        newBalance.toFixed(2),
      );

      // REMOVE FROM SUMMARY
      await this.summaryWorkerService.handleTransactionDelete(tx);

      // DELETE TRANSACTION
      await manager.delete(Transaction, id);

      // LEDGER ENTRY FOR DELETE
      await this.ledgerService.createEntry(
        {
          accountId: tx.account.id,
          creatorId: tx.creatorUser.id,
          entryType: oldType === 'income' ? 'expense' : 'income',
          amount: oldAmount.toString(),
          description: `Transaction #${id} deleted`,
          transactionId: id,
        },
        manager,
      );

      return { success: true, message: 'Transaction deleted' };
    });
  }
}
