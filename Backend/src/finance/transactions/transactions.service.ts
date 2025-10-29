import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transactions } from './transactions.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FindTransactionsDto } from './dto/find-transaction.dto';
import { User } from 'src/auth/entities/user.entity';
import { SummaryService } from 'src/finance/summary/summary.service';
import { Category } from '../categories/categories.entity';
import { Account } from '../account/account.entity';
import { Currency } from '../currencies/currencies.entity';
import {
  BulkTransactionDto,
  TransactionItemDto,
} from './dto/bulk-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transactions)
    private transactionsRepository: Repository<Transactions>,

    @Inject(forwardRef(() => SummaryService))
    private summaryService: SummaryService,
  ) {}

  /** Create a new transaction */
  async create(
    createTransactionDto: CreateTransactionDto,
    user: User,
  ): Promise<Transactions> {
    const transaction = this.transactionsRepository.create({
      type: createTransactionDto.type,
      amount: createTransactionDto.amount,
      transactionDate: createTransactionDto.transactionDate,
      description: createTransactionDto.description,
      recurring: createTransactionDto.recurring ?? false,
      recurringInterval: createTransactionDto.recurringInterval,
      status: createTransactionDto.status ?? 'pending',
      account: createTransactionDto.accountId
        ? ({ id: createTransactionDto.accountId } as Account)
        : undefined,
      category: createTransactionDto.categoryId
        ? ({ id: createTransactionDto.categoryId } as Category)
        : undefined,
      currency: createTransactionDto.currencyCode
        ? ({ code: createTransactionDto.currencyCode } as Currency)
        : undefined,
      creatorUser: { id: user.id } as User,
    });

    const savedTransaction =
      await this.transactionsRepository.save(transaction);

    await this.summaryService.handleTransactionChange(
      undefined,
      savedTransaction,
    );

    return savedTransaction;
  }

  /** Get all transactions with filters */
  async findAll(
    user: User,
    filters?: FindTransactionsDto,
  ): Promise<{
    data: Transactions[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 25;
    const skip = (page - 1) * limit;

    const query = this.transactionsRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.account', 'account')
      .leftJoinAndSelect('transaction.category', 'category')
      .leftJoinAndSelect('transaction.currency', 'currency')
      .where('transaction.creatorUser = :userId', { userId: user.id });

    if (filters?.type)
      query.andWhere('transaction.type = :type', { type: filters.type });
    if (filters?.status)
      query.andWhere('transaction.status = :status', {
        status: filters.status,
      });
    if (filters?.accountId)
      query.andWhere('account.id = :accountId', {
        accountId: filters.accountId,
      });
    if (filters?.categoryId)
      query.andWhere('category.id = :categoryId', {
        categoryId: filters.categoryId,
      });
    if (filters?.currencyCode)
      query.andWhere('currency.code = :currencyCode', {
        currencyCode: filters.currencyCode,
      });
    if (filters?.startDate)
      query.andWhere('transaction.transactionDate >= :startDate', {
        startDate: filters.startDate,
      });
    if (filters?.endDate)
      query.andWhere('transaction.transactionDate <= :endDate', {
        endDate: filters.endDate,
      });

    const [data, total] = await query
      .orderBy('transaction.transactionDate', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  /** Find a transaction by ID */
  async findOne(id: number, user: User): Promise<Transactions> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id, creatorUser: { id: user.id } },
      relations: ['account', 'category', 'currency', 'creatorUser'],
    });

    if (!transaction)
      throw new NotFoundException(
        `Transaction with ID ${id} not found for this user`,
      );

    return transaction;
  }

  /** Delete a transaction */
  async remove(id: number, user: User): Promise<void> {
    const transactionToRemove = await this.findOne(id, user);

    const result = await this.transactionsRepository.delete({
      id: transactionToRemove.id,
      creatorUser: { id: user.id },
    });

    if (result.affected === 0)
      throw new NotFoundException(`Transaction with ID ${id} not found.`);

    await this.summaryService.handleTransactionChange(
      transactionToRemove,
      undefined,
    );
  }

  /** Update a transaction */
  async update(
    id: number,
    updateTransactionDto: UpdateTransactionDto,
    user: User,
  ): Promise<Transactions> {
    const transaction = await this.findOne(id, user);
    const oldTransaction = { ...transaction };

    if (updateTransactionDto.accountId)
      transaction.account = { id: updateTransactionDto.accountId } as Account;

    if (updateTransactionDto.categoryId)
      transaction.category = {
        id: updateTransactionDto.categoryId,
      } as Category;

    if (updateTransactionDto.currencyCode)
      transaction.currency = {
        code: updateTransactionDto.currencyCode,
      } as Currency;

    if (updateTransactionDto.transactionDate)
      transaction.transactionDate = updateTransactionDto.transactionDate;

    Object.assign(transaction, updateTransactionDto);

    const savedTransaction =
      await this.transactionsRepository.save(transaction);

    await this.summaryService.handleTransactionChange(
      oldTransaction,
      savedTransaction,
    );

    return savedTransaction;
  }

  /** Bulk create transactions */

  async createBulk(
    user: User,
    bulkDto: BulkTransactionDto,
  ): Promise<Transactions[]> {
    const { type, accountId, currencyCode, transactionDate, transactions } =
      bulkDto;

    if (!transactions?.length) return [];

    const createdEntities = transactions.map((t: TransactionItemDto) => {
      const transaction = this.transactionsRepository.create({
        type,
        amount: t.amount,
        transactionDate,
        description:
          t.description ?? `${type} transaction for ${transactionDate}`,
        account: { id: accountId } as Partial<Account>,
        category: t.categoryId
          ? ({ id: t.categoryId } as Partial<Category>)
          : null,
        currency: { code: currencyCode } as Partial<Currency>,
        creatorUser: { id: user.id } as Partial<User>,
      } as Partial<Transactions>);

      return transaction;
    });

    const savedTransactions =
      await this.transactionsRepository.save(createdEntities);

    for (const txn of savedTransactions) {
      await this.summaryService.handleTransactionChange(undefined, txn);
    }

    return savedTransactions;
  }
}
