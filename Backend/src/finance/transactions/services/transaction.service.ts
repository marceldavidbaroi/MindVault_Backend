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

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    private readonly verifyUserService: VerifyUserService,
    private readonly currencyService: CurrencyService,
    private readonly categoryService: CategoriesService,
    private readonly dataSource: DataSource,

    // NOTE: AccountService is used only to validate the account exists
    private readonly accountService: AccountsService,
  ) {}

  async createTransaction(
    dto: CreateTransactionDto,
  ): Promise<{ success: boolean; message: string; data?: Transaction }> {
    return await this.dataSource.transaction(async (manager) => {
      // validate user exists
      const user: User = await this.verifyUserService.verify(dto.creatorUserId);
      // validate account
      const account: Account = await this.accountService.getAccount(
        dto.accountId,
        user,
      );
      if (!account) throw new NotFoundException('Account not found');

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

  async listTransactions(filters: any) {
    const qb = this.transactionRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.account', 'account');

    if (filters.accountId)
      qb.andWhere('account.id = :accountId', { accountId: filters.accountId });
    if (filters.categoryId)
      qb.andWhere('t.categoryId = :categoryId', {
        categoryId: filters.categoryId,
      });
    if (filters.from)
      qb.andWhere('t.transactionDate >= :from', { from: filters.from });
    if (filters.to) qb.andWhere('t.transactionDate <= :to', { to: filters.to });
    if (filters.type) qb.andWhere('t.type = :type', { type: filters.type });
    if (filters.status)
      qb.andWhere('t.status = :status', { status: filters.status });

    const page =
      filters.page && Number(filters.page) > 0 ? Number(filters.page) : 1;
    const pageSize =
      filters.pageSize && Number(filters.pageSize) > 0
        ? Number(filters.pageSize)
        : 20;
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
