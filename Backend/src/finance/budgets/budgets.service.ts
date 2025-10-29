import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Budgets } from './budgets.entity';
import { Repository } from 'typeorm';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { User } from 'src/auth/entities/user.entity';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { FindBudgetsDto } from './dto/find-budget.dto';
import { Transactions } from 'src/finance/transactions/transactions.entity';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budgets)
    private budgetsRepository: Repository<Budgets>,
    @InjectRepository(Transactions)
    private transactionsRepository: Repository<Transactions>,
  ) {}

  /** Create a new budget */
  // async create(createBudgetDto: CreateBudgetDto, user: User): Promise<Budgets> {
  //   const budget = this.budgetsRepository.create({
  //     amount: createBudgetDto.amount,
  //     category: createBudgetDto.category,
  //     month: createBudgetDto.month,
  //     year: createBudgetDto.year,
  //     user: { id: user.id },
  //   } as Partial<Budgets>);

  //   return this.budgetsRepository.save(budget);
  // }

  // /** Find all budgets with optional filters (year, month, category) */
  // async findAll(
  //   user: User,
  //   filters?: FindBudgetsDto,
  // ): Promise<{
  //   data: Budgets[];
  //   total: number;
  //   page: number;
  //   limit: number;
  // }> {
  //   const page = filters?.page ?? 1;
  //   const limit = filters?.limit ?? 25;
  //   const skip = (page - 1) * limit;

  //   const query = this.budgetsRepository
  //     .createQueryBuilder('budget')
  //     .where('budget.userId = :userId', { userId: user.id });

  //   if (filters?.category) {
  //     query.andWhere('budget.category = :category', {
  //       category: filters.category,
  //     });
  //   }

  //   if (filters?.month) {
  //     query.andWhere('budget.month = :month', { month: filters.month });
  //   }

  //   if (filters?.year) {
  //     query.andWhere('budget.year = :year', { year: filters.year });
  //   }

  //   const [data, total] = await query
  //     .orderBy('budget.updatedAt', 'DESC')
  //     .skip(skip)
  //     .take(limit)
  //     .getManyAndCount();

  //   return { data, total, page, limit };
  // }

  // /** Find a single budget by ID */
  // async findOne(id: number, user: User): Promise<Budgets> {
  //   const budget = await this.budgetsRepository.findOne({
  //     where: { id, user: { id: user.id } },
  //   });

  //   if (!budget) {
  //     throw new NotFoundException(
  //       `Budget with ID ${id} not found for this user`,
  //     );
  //   }

  //   return budget;
  // }

  // /** Update a budget */
  // async update(
  //   id: number,
  //   updateBudgetDto: UpdateBudgetDto,
  //   user: User,
  // ): Promise<Budgets> {
  //   const budget = await this.findOne(id, user);

  //   Object.assign(budget, updateBudgetDto);

  //   return this.budgetsRepository.save(budget);
  // }

  // /** Remove a budget */
  // async remove(id: number, user: User): Promise<void> {
  //   const budget = await this.findOne(id, user);
  //   await this.budgetsRepository.remove(budget);
  // }

  // /**
  //  * Check which budgets are nearing their limit
  //  * @param user - the authenticated user
  //  * @param threshold - fraction of budget to trigger alert (0.9 = 90%)
  //  * @param month - optional month filter
  //  * @param year - optional year filter
  //  * @returns list of budgets with current spending and limit status
  //  */
  // async getBudgetAlerts(
  //   user: User,
  //   threshold = 0.9,
  //   month?: number,
  //   year?: number,
  // ): Promise<
  //   Array<{
  //     budget: Budgets;
  //     spent: number;
  //     limitReached: boolean;
  //     percentageUsed: number;
  //   }>
  // > {
  //   // Fetch all budgets for the user (optional month/year filters)
  //   const budgets = await this.budgetsRepository.find({
  //     where: {
  //       user: { id: user.id },
  //       ...(month ? { month } : {}),
  //       ...(year ? { year } : {}),
  //     },
  //   });

  //   const alerts: Array<{
  //     budget: Budgets;
  //     spent: number;
  //     limitReached: boolean;
  //     percentageUsed: number;
  //   }> = [];

  //   for (const budget of budgets) {
  //     // Sum transactions for this budget category, month, year
  //     const result: { totalSpent: string | null } | null | undefined =
  //       await this.transactionsRepository
  //         .createQueryBuilder('transaction')
  //         .select('SUM(transaction.amount)', 'totalSpent')
  //         .where('transaction.userId = :userId', { userId: user.id })
  //         .andWhere('transaction.category = :category', {
  //           category: budget.category,
  //         })
  //         .andWhere('EXTRACT(MONTH FROM transaction.date) = :month', {
  //           month: budget.month,
  //         })
  //         .andWhere('EXTRACT(YEAR FROM transaction.date) = :year', {
  //           year: budget.year,
  //         })
  //         .andWhere('transaction.type = :type', { type: 'expense' })
  //         .getRawOne();

  //     const spent = result?.totalSpent ? parseFloat(result.totalSpent) : 0;

  //     const percentageUsed = spent / budget.amount;
  //     const limitReached = percentageUsed >= threshold;

  //     if (limitReached) {
  //       alerts.push({
  //         budget,
  //         spent,
  //         limitReached,
  //         percentageUsed,
  //       });
  //     }
  //   }

  //   return alerts;
  // }
}
