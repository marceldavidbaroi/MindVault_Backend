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
      .leftJoinAndSelect('t.account', 'account')
      .leftJoinAndSelect('t.creatorUser', 'creator')
      .leftJoinAndSelect('t.category', 'category')
      .leftJoinAndSelect('t.currency', 'currency');

    // Mandatory filter: accountId
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

    return {
      success: true,
      message: 'OK',
      data: { items, total, page, pageSize },
    };
  }

  async updateTransaction(id: number, dto: UpdateTransactionDto) {
    const tx = await this.transactionRepo.findOne({ where: { id } });
    if (!tx) return { success: false, message: 'Transaction not found' };
    const oldTransactionBalance = Number(tx.amount);
    const accountBalance = Number(await this.accountService.getBalance(id));
    const newBalance =
      accountBalance - oldTransactionBalance + Number(dto.amount);
    await this.accountService.updateBalance(
      id,
      newBalance.toFixed(2).toString(),
    );
    Object.assign(tx, dto);
    const updated = await this.transactionRepo.save(tx);

    return { success: true, message: 'Transaction updated', data: updated };
  }

  async deleteTransaction(id: number) {
    const tx = await this.transactionRepo.findOne({ where: { id } });
    if (!tx) return { success: false, message: 'Transaction not found' };

    await this.transactionRepo.delete(id);
    return { success: true, message: 'Transaction deleted' };
  }
}
