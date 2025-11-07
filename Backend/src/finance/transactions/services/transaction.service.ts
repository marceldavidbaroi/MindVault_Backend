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
import { Account } from 'src/finance/accounts/entity/account.entity';
import { User } from 'src/auth/entities/user.entity';
import { Category } from 'src/finance/categories/categories.entity';
import { Currency } from 'src/finance/currency/entity/currency.entity';
import { VerifyUserService } from 'src/auth/services/verify-user.service';
import { CurrencyService } from 'src/finance/currency/services/currency.service';
import { CategoriesService } from 'src/finance/categories/categories.service';
import { AccountsService } from 'src/finance/accounts/services/accounts.service';
import { AccountUserRolesService } from 'src/finance/accounts/services/account-user-roles.service.service';
import { ListTransactionsFilterDto } from '../dto/list-transactions.dto';
import { SummaryWorkerService } from 'src/finance/summary/services/summary-worker.service';

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

    // NOTE: AccountService is used only to validate the account exists
    private readonly accountService: AccountsService,
  ) {}

  async createTransaction(
    userId: number,
    dto: CreateTransactionDto,
  ): Promise<{ success: boolean; message: string; data?: Transaction }> {
    return await this.dataSource.transaction(async (manager) => {
      // validate user exists
      const user: User = await this.verifyUserService.verify(userId);
      // validate account
      const account = await this.accountUserRolesService.getUserRoleForAccount(
        userId,
        dto.accountId,
      );

      // optionally fetch category and currency
      const category = dto.categoryId
        ? await this.categoryService.verifyCategory(dto.categoryId)
        : undefined;

      const currency = dto.currencyCode
        ? await this.currencyService.verifyCurrency(dto.currencyCode)
        : undefined;

      // check externalRef uniqueness
      if (dto.externalRefId) {
        const existing = await manager.findOne(Transaction, {
          where: { externalRefId: dto.externalRefId },
        });
        if (existing)
          throw new BadRequestException('externalRefId must be unique');
      }

      // create transaction entity
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

      // save transaction atomically
      const saved = await manager.save(tx);
      const balance = Number(
        await this.accountService.getBalance(dto.accountId),
      );
      const amount = Number(dto.amount);

      let newBalance: number;

      if (dto.type === 'income') {
        newBalance = balance + amount;
      } else {
        newBalance = balance - amount;
      }

      // ✅ keep as number (if updateBalance expects number)
      await this.accountService.updateBalance(
        dto.accountId,
        newBalance.toFixed(2).toString(),
      );
      await this.summaryWorkerService.handleTransaction(tx);

      // ✅ Future-proof: you can update account balance here safely
      // Example:
      // await this.accountService.applyTransaction(account.id, dto.type, dto.amount, manager);

      // ✅ Future-proof: schedule recurring transaction here if needed
      // Example:
      // if (dto.recurring && dto.recurringInterval) {
      //   await this.recurringService.createScheduleForTransaction(saved.id, dto.creatorUserId, dto.recurringInterval, dto.transactionDate, manager);
      // }

      return { success: true, message: 'Transaction created', data: saved };
    });
  }

  async getTransaction(id: number) {
    const tx = await this.transactionRepo.findOne({ where: { id } });
    if (!tx) return { success: false, message: 'Transaction not found' };
    return { success: true, message: 'OK', data: tx };
  }

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
        // Transaction fields
        't.id',
        't.type',
        't.amount',
        't.transactionDate',
        't.description',
        't.status',
        't.recurring',
        't.recurringInterval',
        't.externalRefId',
        // 't.createdAt',
        // 't.updatedAt',

        // Related minimal fields
        'account.id',
        'account.name',
        'category.id',
        'category.name',
        'currency.code',
        'currency.symbol',
        'creator.id',
        'creator.username',
      ]);

    // Mandatory filter
    qb.where('account.id = :accountId', { accountId });

    // Optional filters
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

    // Pagination
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const pageSize =
      filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;

    qb.skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('t.transactionDate', 'DESC');

    const [items, total] = await qb.getManyAndCount();

    // Return clean, lightweight structure
    const formattedItems = items.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      transactionDate: t.transactionDate,
      description: t.description,
      status: t.status,
      recurring: t.recurring,
      recurringInterval: t.recurringInterval,
      externalRefId: t.externalRefId,
      // createdAt: t.createdAt,
      // updatedAt: t.updatedAt,
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
      data: { items: formattedItems, total, page, pageSize },
    };
  }

  async updateTransaction(id: number, dto: UpdateTransactionDto) {
    // Fetch the transaction with necessary relations
    const tx = await this.transactionRepo.findOne({
      where: { id },
      relations: ['account', 'currency', 'creatorUser', 'category'],
    });

    if (!tx) {
      return { success: false, message: 'Transaction not found' };
    }

    const oldTx = { ...tx };
    const oldTransactionAmount = Number(tx.amount);

    // Update account balance if amount changes
    if (dto.amount && dto.amount !== tx.amount) {
      const accountBalance = Number(
        await this.accountService.getBalance(tx.account.id),
      );
      const newBalance =
        accountBalance - oldTransactionAmount + Number(dto.amount);
      await this.accountService.updateBalance(
        tx.account.id,
        newBalance.toFixed(2).toString(),
      );
    }

    // Prevent externalRefId duplicates
    if (dto.externalRefId && dto.externalRefId !== tx.externalRefId) {
      const existing = await this.transactionRepo.findOne({
        where: { externalRefId: dto.externalRefId },
      });
      if (existing && existing.id !== id) {
        return {
          success: false,
          message: 'externalRefId already exists',
        };
      }
      tx.externalRefId = dto.externalRefId;
    }

    // Only update allowed fields
    const updatableFields = [
      'amount',
      'type',
      'description',
      'transactionDate',
      'status',
      'recurring',
      'recurringInterval',
    ];
    updatableFields.forEach((field) => {
      if (dto[field] !== undefined) {
        tx[field] = dto[field];
      }
    });

    // Update relations if provided
    if (dto.accountId) tx.account = { id: dto.accountId } as any;
    if (dto.categoryId) tx.category = { id: dto.categoryId } as any;
    if (dto.currencyCode) tx.currency = { code: dto.currencyCode } as any;

    // Save updated transaction
    const updated = await this.transactionRepo.save(tx);

    // Handle summary updates
    await this.summaryWorkerService.handleTransactionUpdate(oldTx, tx);

    return { success: true, message: 'Transaction updated', data: updated };
  }

  async deleteTransaction(id: number) {
    const tx = await this.transactionRepo.findOne({ where: { id } });
    if (!tx) return { success: false, message: 'Transaction not found' };

    await this.transactionRepo.delete(id);
    return { success: true, message: 'Transaction deleted' };
  }
}
