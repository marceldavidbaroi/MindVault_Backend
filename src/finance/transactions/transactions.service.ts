import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Transactions } from './transactions.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { User } from 'src/auth/user.entity';
import { FindTransactionsDto } from './dto/find-transaction.dto';
import { SummaryService } from 'src/finance/summary/summary.service'; // 1. Import SummaryService
import { Category } from '../categories/categories.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transactions)
    private transactionsRepository: Repository<Transactions>,
    @Inject(forwardRef(() => SummaryService)) // ⚡ forwardRef solves circular DI
    private summaryService: SummaryService,
  ) {}

  /** Create a new transaction */
  async create(
    createTransactionDto: CreateTransactionDto,
    user: User,
  ): Promise<Transactions> {
    const transaction = this.transactionsRepository.create({
      type: createTransactionDto.type,
      category: { id: createTransactionDto.categoryId }, // ✅ relation by ID
      amount: createTransactionDto.amount,
      date: createTransactionDto.date, // Use string date
      description: createTransactionDto.description,
      recurring: createTransactionDto.recurring ?? false,
      recurringInterval: createTransactionDto.recurringInterval,
      user: { id: user.id },
    } as Partial<Transactions>);

    const savedTransaction =
      await this.transactionsRepository.save(transaction);

    // 3. HOOK: Notify SummaryService about the new transaction
    await this.summaryService.handleTransactionChange(
      undefined,
      savedTransaction,
    );

    return savedTransaction;
  }

  /** Find all transactions with optional filters + pagination */
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
      .leftJoinAndSelect('transaction.category', 'category') // ✅ join for filtering
      .where('transaction.user_id = :userId', { userId: user.id });

    if (filters?.type) {
      query.andWhere('transaction.type = :type', { type: filters.type });
    }

    if (filters?.categoryId) {
      query.andWhere('category.id = :categoryId', {
        categoryId: filters.categoryId,
      });
    }

    if (filters?.startDate) {
      query.andWhere('transaction.date >= :startDate', {
        startDate: new Date(filters.startDate).toISOString().split('T')[0], // Use string date for query
      });
    }

    if (filters?.endDate) {
      query.andWhere('transaction.date <= :endDate', {
        endDate: new Date(filters.endDate).toISOString().split('T')[0], // Use string date for query
      });
    }

    const [data, total] = await query
      .orderBy('transaction.updatedAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  /** Find a single transaction by numeric ID */
  async findOne(id: number, user: User): Promise<Transactions> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id, user: { id: user.id } },
      relations: ['category', 'user'], // ⚡ Added 'user' relation for summary hook compatibility
    });

    if (!transaction) {
      throw new NotFoundException(
        `Transaction with ID ${id} not found for this user`,
      );
    }

    return transaction;
  }

  /** Remove a transaction */
  async remove(id: number, user: User): Promise<void> {
    // Load the full transaction object (including relations) before removal for the hook
    const transactionToRemove = await this.findOne(id, user);

    const result = await this.transactionsRepository.delete({
      id: transactionToRemove.id,
      user: { id: user.id },
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Transaction with ID ${id} not found.`);
    }

    // 4. HOOK: Notify SummaryService about the deletion
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
    // Load the transaction with required relations to capture the 'old' state for the hook
    const transaction = await this.findOne(id, user);

    // Capture the 'old' state before applying changes
    const oldTransaction = { ...transaction };

    // Update relations if DTO provides new IDs
    if (updateTransactionDto.categoryId) {
      transaction.category = {
        id: updateTransactionDto.categoryId,
      } as Category; // ⚡ FIX: Assert relation object as Category
    }

    // Update date column (must be serialized to YYYY-MM-DD string)
    if (updateTransactionDto.date) {
      transaction.date = new Date(updateTransactionDto.date) // ⚡ FIX: Convert Date to YYYY-MM-DD string
        .toISOString()
        .split('T')[0];
    }

    // Apply other updates
    Object.assign(transaction, updateTransactionDto);

    const savedTransaction =
      await this.transactionsRepository.save(transaction);

    // 5. HOOK: Notify SummaryService about the update
    await this.summaryService.handleTransactionChange(
      oldTransaction as Transactions,
      savedTransaction,
    );

    return savedTransaction;
  }

  /** Bulk create transactions */
  async createBulk(
    user: User,
    type: 'income' | 'expense',
    date: string | Date,
    transactions: {
      categoryId: number;
      amount: number;
      description?: string;
    }[], // Added description field
  ): Promise<Transactions[]> {
    if (!transactions?.length) return [];

    const txDate = new Date(date);
    const dateStr = txDate.toISOString().split('T')[0]; // YYYY-MM-DD

    const createdEntities = transactions.map((t) =>
      this.transactionsRepository.create({
        type,
        category: { id: t.categoryId },
        amount: t.amount,
        date: dateStr, // ⚡ FIX: Use string date
        description:
          t.description ||
          `${type.charAt(0).toUpperCase() + type.slice(1)} transaction for ${dateStr}`,
        user: { id: user.id },
      } as Partial<Transactions>),
    );

    const savedTransactions =
      await this.transactionsRepository.save(createdEntities);

    // 6. HOOK: Notify SummaryService for each bulk created transaction
    for (const txn of savedTransactions) {
      await this.summaryService.handleTransactionChange(undefined, txn);
    }

    return savedTransactions;
  }
}
