import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, DeepPartial } from 'typeorm';
import {
  RecurringInterval,
  Transaction,
  TransactionStatus,
} from '../entities/transaction.entity';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { User } from 'src/auth/entity/user.entity';
import { CurrencyService } from 'src/finance/currency/services/currency.service';
import { CategoriesService } from 'src/finance/categories/categories.service';
import { AccountsService } from 'src/finance/accounts/services/accounts.service';
import { AccountUserRolesService } from 'src/finance/accounts/services/account-user-roles.service.service';
import { ListTransactionsFilterDto } from '../dto/list-transactions.dto';
import { SummaryWorkerService } from 'src/finance/summary/services/summary-worker.service';
import { LedgerService } from './ledger.service';
import { safeAdd, safeSubtract } from 'src/common/utils/decimal-balance';
import { BulkCreateTransactionDto } from '../dto/bulk-create-transaction.dto';
import { MonthlySummary } from 'src/finance/summary/entity/monthly-summary.entity';
import { YearlySummary } from 'src/finance/summary/entity/yearly-summary.entity';
import { UserValidator } from 'src/auth/validator/user.validator';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    private readonly userValidator: UserValidator,
    private readonly currencyService: CurrencyService,
    private readonly categoryService: CategoriesService,
    private readonly dataSource: DataSource,
    private readonly accountUserRolesService: AccountUserRolesService,
    private readonly summaryWorkerService: SummaryWorkerService,
    private readonly accountService: AccountsService,
    private readonly ledgerService: LedgerService,
    @InjectRepository(MonthlySummary)
    private readonly monthlySummaryRepo: Repository<MonthlySummary>,

    @InjectRepository(YearlySummary)
    private readonly yearlySummaryRepo: Repository<YearlySummary>,
  ) {}

  private async verifyAccountPermission(userId: number, accountId: number) {
    const userRole = await this.accountUserRolesService.getUserRoleForAccount(
      userId,
      accountId,
    );

    return userRole;
  }

  // ----------------------------------------------------------
  // CREATE TRANSACTION
  // ----------------------------------------------------------

  async createTransaction(userId: number, dto: CreateTransactionDto) {
    return await this.dataSource.transaction(async (manager) => {
      const user: User = await this.userValidator.ensureUserExists(userId);
      await this.verifyAccountPermission(userId, dto.accountId);

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

  async createBulkTransactionsOptimized(
    userId: number,
    dto: BulkCreateTransactionDto,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const user: User = await this.userValidator.ensureUserExists(userId);
      const account = await this.accountUserRolesService.getUserRoleForAccount(
        userId,
        dto.accountId,
      );
      const currency = dto.currencyCode
        ? await this.currencyService.verifyCurrency(dto.currencyCode)
        : undefined;

      const results: Transaction[] = [];

      for (const item of dto.transactions) {
        const category = item.categoryId
          ? await this.categoryService.verifyCategory(item.categoryId)
          : undefined;

        if (item.externalRefId) {
          const existing = await manager.findOne(Transaction, {
            where: { externalRefId: item.externalRefId },
          });
          if (existing)
            throw new BadRequestException(
              `externalRefId ${item.externalRefId} must be unique`,
            );
        }

        const tx: DeepPartial<Transaction> = {
          account: account as any,
          creatorUser: user,
          category: category as any,
          type: dto.type ?? 'expense',
          amount: item.amount.toString(), // ensure string for decimal
          currency: currency as any,
          transactionDate: item.transactionDate
            ? item.transactionDate
            : new Date().toISOString().split('T')[0],
          description: dto.description,
          status:
            dto.status &&
            ['pending', 'cleared', 'void', 'failed'].includes(dto.status)
              ? (dto.status as TransactionStatus)
              : 'pending',
          externalRefId: item.externalRefId,
          recurring: dto.recurring ?? false,
          recurringInterval:
            dto.recurringInterval &&
            ['daily', 'weekly', 'monthly', 'yearly'].includes(
              dto.recurringInterval,
            )
              ? (dto.recurringInterval as RecurringInterval)
              : undefined,
        };

        const savedTx = await manager.save(Transaction, tx);

        // Update account balance
        const currentBalance = await this.accountService.getBalance(
          dto.accountId,
        );
        const balance =
          tx.type === 'income'
            ? safeAdd(currentBalance, item.amount)
            : safeSubtract(currentBalance, item.amount);

        await this.accountService.updateBalance(dto.accountId, balance);

        // Update summary
        await this.summaryWorkerService.handleTransaction(savedTx);

        // Ledger entry
        await this.ledgerService.createEntry(
          {
            accountId: account.id,
            creatorId: user.id,
            entryType: tx.type as 'income' | 'expense', // now strictly 'income' | 'expense'
            amount: item.amount,
            description: tx.description ?? `Transaction #${savedTx.id} created`,
            transactionId: savedTx.id,
          },
          manager,
        );

        results.push(savedTx);
      }

      return {
        success: true,
        message: 'Bulk transactions created',
        data: results,
      };
    });
  }

  // ----------------------------------------------------------
  // GET SINGLE TRANSACTION
  // ----------------------------------------------------------

  async getTransaction(id: number) {
    const tx = await this.transactionRepo.findOne({
      where: { id },
      relations: ['account', 'creatorUser', 'category', 'currency'],
    });

    if (!tx) {
      return {
        success: false,
        message: `Transaction with ID ${id} not found.`,
      };
    }

    return {
      success: true,
      message: `Transaction with ID ${id} fetched successfully.`,
      data: tx,
    };
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
      message: 'Transactions Fetched Successfully',
      data: formatted,
      meta: { total, page, pageSize },
    };
  }

  // ----------------------------------------------------------
  // UPDATE TRANSACTION + SUMMARY UPDATE
  // ----------------------------------------------------------

  // ---------------------------- UPDATE ----------------------------

  // ----------------------------------------------------------
  // UPDATE TRANSACTION + SUMMARY UPDATE
  // ----------------------------------------------------------
  async updateTransaction(
    userId: number,
    id: number,
    dto: UpdateTransactionDto,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const tx = await manager.findOne(Transaction, {
        where: { id },
        relations: ['account', 'currency', 'creatorUser', 'category'],
      });

      if (!tx) return { success: false, message: 'Transaction not found' };
      await this.verifyAccountPermission(userId, tx.account.id);

      const oldTx = { ...tx };
      let ledgerNeeded = false;

      const oldAmount = Number(tx.amount);
      const oldType = tx.type;
      const oldAccountId = tx.account.id;

      // -------------------------------
      // BALANCE RECALCULATION
      // -------------------------------
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

      // -------------------------------
      // EXTERNAL REF CHECK
      // -------------------------------
      if (dto.externalRefId && dto.externalRefId !== tx.externalRefId) {
        const exists = await manager.findOne(Transaction, {
          where: { externalRefId: dto.externalRefId },
        });
        if (exists && exists.id !== id)
          throw new BadRequestException('externalRefId already exists');
        tx.externalRefId = dto.externalRefId;
      }

      // -------------------------------
      // SIMPLE FIELD UPDATE
      // -------------------------------
      if (dto.amount !== undefined) tx.amount = dto.amount;
      if (dto.type !== undefined) tx.type = dto.type;
      if (dto.description !== undefined) tx.description = dto.description;
      if (dto.transactionDate !== undefined)
        tx.transactionDate = dto.transactionDate;
      if (dto.status !== undefined) tx.status = dto.status;
      if (dto.recurring !== undefined) tx.recurring = dto.recurring;
      if (dto.recurringInterval !== undefined)
        tx.recurringInterval = dto.recurringInterval;

      // -------------------------------
      // RELATIONS
      // -------------------------------
      if (dto.accountId !== undefined)
        tx.account = { id: dto.accountId } as any;
      if (dto.categoryId !== undefined)
        tx.category = { id: dto.categoryId } as any;
      if (dto.currencyCode !== undefined)
        tx.currency = { code: dto.currencyCode } as any;

      const updated = await manager.save(tx);

      // -------------------------------
      // UPDATE SUMMARY TABLES
      // -------------------------------
      await this.summaryWorkerService.handleTransactionUpdate(oldTx, updated);

      // -------------------------------
      // LEDGER ENTRY (IMMUTABLE)
      // -------------------------------
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
  async deleteTransaction(userId: number, id: number) {
    return await this.dataSource.transaction(async (manager) => {
      const tx = await manager.findOne(Transaction, {
        where: { id },
        relations: ['account', 'creatorUser'],
      });

      if (!tx) return { success: false, message: 'Transaction not found' };
      await this.verifyAccountPermission(userId, tx.account.id);

      const oldAmount = tx.amount;
      const oldType = tx.type;
      const accountId = tx.account.id;

      // -------------------------------
      // RESTORE BALANCE
      // -------------------------------
      const currentBalance = await this.accountService.getBalance(accountId);
      const restoredBalance =
        oldType === 'income'
          ? safeSubtract(currentBalance, oldAmount)
          : safeAdd(currentBalance, oldAmount);

      await this.accountService.updateBalance(accountId, restoredBalance);

      // -------------------------------
      // REMOVE FROM SUMMARY
      // -------------------------------
      await this.summaryWorkerService.handleTransactionDelete(tx);

      // -------------------------------
      // DELETE LEDGER ENTRIES FOR THIS TX
      // -------------------------------
      await manager.delete('account_ledger', { transactionId: tx.id });

      // -------------------------------
      // DELETE TRANSACTION
      // -------------------------------
      await manager.delete(Transaction, { id: tx.id });

      // -------------------------------
      // LEDGER ENTRY FOR DELETE (REVERSE)
      // -------------------------------
      await this.ledgerService.createEntry(
        {
          accountId,
          creatorId: tx.creatorUser.id,
          entryType: oldType === 'income' ? 'expense' : 'income',
          amount: oldAmount,
          description: `Transaction #${id} deleted`,
          transactionId: id,
        },
        manager,
      );

      return { success: true, message: 'Transaction deleted' };
    });
  }
  async getOptimizedStatement(accountId: number, from: string, to: string) {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    // --------------------------
    // 1️⃣ Opening Balance
    // --------------------------
    // a) Years before start year
    const yearlyBefore = await this.yearlySummaryRepo
      .createQueryBuilder('y')
      .select(
        'COALESCE(SUM(y.totalIncome)::float - SUM(y.totalExpense)::float, 0)',
        'balance',
      )
      .where('y.account_id = :accountId', { accountId })
      .andWhere('y.year < :fromYear', { fromYear: fromDate.getFullYear() })
      .getRawOne();

    // b) Months before start month in start year
    const monthlyBefore = await this.monthlySummaryRepo
      .createQueryBuilder('m')
      .select(
        'COALESCE(SUM(m.totalIncome)::float - SUM(m.totalExpense)::float, 0)',
        'balance',
      )
      .where('m.account_id = :accountId', { accountId })
      .andWhere('m.year = :year AND m.month < :month', {
        year: fromDate.getFullYear(),
        month: fromDate.getMonth() + 1,
      })
      .getRawOne();

    // c) Optional: weeks before start week (for very granular)
    // const weeklyBefore = ...

    let openingBalance =
      parseFloat(yearlyBefore.balance) + parseFloat(monthlyBefore.balance);

    // --------------------------
    // 2️⃣ Transactions in range
    // --------------------------
    const transactions = await this.transactionRepo
      .createQueryBuilder('t')
      .leftJoin('t.category', 'category')
      .leftJoin('t.currency', 'currency')
      .select([
        't.id',
        't.type',
        't.amount',
        't.transactionDate',
        't.description',
        't.status',
        'category.id',
        'category.name',
        'currency.code',
        'currency.symbol',
      ])
      .where('t.account_id = :accountId', { accountId })
      .andWhere('t.transactionDate BETWEEN :from AND :to', { from, to })
      .orderBy('t.transactionDate', 'ASC')
      .addOrderBy('t.id', 'ASC')
      .getMany();

    // --------------------------
    // 3️⃣ Calculate running balance
    // --------------------------
    let runningBalance = openingBalance;
    const formattedTxs = transactions.map((t) => {
      runningBalance +=
        t.type === 'income' ? parseFloat(t.amount) : -parseFloat(t.amount);
      return {
        ...t,
        amount: parseFloat(t.amount),
        runningBalance: runningBalance.toFixed(2),
      };
    });

    const closingBalance = runningBalance;

    return {
      success: true,
      message: 'Optimized statement generated successfully',
      data: {
        openingBalance: openingBalance.toFixed(2),
        transactions: formattedTxs,
        closingBalance: closingBalance.toFixed(2),
      },
    };
  }
}
