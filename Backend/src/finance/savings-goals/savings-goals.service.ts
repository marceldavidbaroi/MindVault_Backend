import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SavingsGoals } from './savings-goals.entity';
import { CreateSavingsGoalDto } from './dto/create-savings-goals.dto';
import { UpdateSavingsGoalDto } from './dto/update-savings-goals.dto';
import { FindSavingsGoalsDto } from './dto/find-savings-goal.dto';
import { User } from 'src/auth/entities/user.entity';
import { TransactionsService } from 'src/finance/transactions/transactions.service';
import { CreateTransactionDto } from 'src/finance/transactions/dto/create-transaction.dto';
// import {
//   TransactionType,
//   ExpenseCategory,
// } from 'src/finance/transactions/transactions.enum';

@Injectable()
export class SavingsGoalsService {
  constructor(
    @InjectRepository(SavingsGoals)
    private readonly savingsGoalsRepository: Repository<SavingsGoals>,
    private readonly transactionsService: TransactionsService,
  ) {}

  /** Helper: recalculate saved_amount from transactions */
  // private async recalcSavedAmount(goal: SavingsGoals): Promise<number> {
  //   const totalSaved =
  //     goal.transactions
  //       ?.filter(
  //         (t) =>
  //           t.category === ExpenseCategory.SAVINGS_INVESTMENTS &&
  //           t.type === TransactionType.EXPENSE,
  //       )
  //       .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;

  //   goal.savedAmount = totalSaved;
  //   await this.savingsGoalsRepository.save(goal);
  //   return totalSaved;
  // }

  // /** List all savings goals with optional filters and pagination (including transactions) */
  // async findAll(user: User, filters?: FindSavingsGoalsDto) {
  //   const page = filters?.page ?? 1;
  //   const limit = filters?.limit ?? 25;
  //   const skip = (page - 1) * limit;

  //   const query = this.savingsGoalsRepository
  //     .createQueryBuilder('goal')
  //     .leftJoinAndSelect('goal.transactions', 'transactions')
  //     .where('goal.userId = :userId', { userId: user.id });

  //   if (filters?.name) {
  //     query.andWhere('goal.name ILIKE :name', { name: `%${filters.name}%` });
  //   }

  //   if (filters?.priority) {
  //     query.andWhere('goal.priority = :priority', {
  //       priority: filters.priority,
  //     });
  //   }

  //   if (filters?.month) {
  //     query.andWhere('EXTRACT(MONTH FROM goal.due_date) = :month', {
  //       month: filters.month,
  //     });
  //   }

  //   if (filters?.year) {
  //     query.andWhere('EXTRACT(YEAR FROM goal.due_date) = :year', {
  //       year: filters.year,
  //     });
  //   }

  //   const [data, total] = await query
  //     .orderBy('goal.updatedAt', 'DESC')
  //     .skip(skip)
  //     .take(limit)
  //     .getManyAndCount();

  //   // Recalculate saved_amount for each goal
  //   data.forEach((goal) => {
  //     goal.savedAmount =
  //       goal.transactions
  //         ?.filter(
  //           (t) =>
  //             t.category === ExpenseCategory.SAVINGS_INVESTMENTS &&
  //             t.type === TransactionType.EXPENSE,
  //         )
  //         .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;
  //   });

  //   return { data, total, page, limit };
  // }

  // /** Find a single savings goal by ID (with transactions) */
  // async findOne(id: number, user: User): Promise<SavingsGoals> {
  //   const goal = await this.savingsGoalsRepository.findOne({
  //     where: { id, user: { id: user.id } },
  //     relations: ['transactions'],
  //   });

  //   if (!goal)
  //     throw new NotFoundException(`Savings goal with ID ${id} not found`);

  //   // Recalculate saved_amount dynamically
  //   goal.savedAmount =
  //     goal.transactions
  //       ?.filter(
  //         (t) =>
  //           t.category === ExpenseCategory.SAVINGS_INVESTMENTS &&
  //           t.type === TransactionType.EXPENSE,
  //       )
  //       .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;

  //   return goal;
  // }

  // /** Create a new savings goal */
  // async create(
  //   createDto: CreateSavingsGoalDto,
  //   user: User,
  // ): Promise<SavingsGoals> {
  //   const goal = this.savingsGoalsRepository.create({
  //     ...createDto,
  //     user: { id: user.id },
  //   });
  //   const saved = await this.savingsGoalsRepository.save(goal);
  //   return this.findOne(saved.id, user); // reload with transactions
  // }

  // /** Update a savings goal */
  // async update(
  //   id: number,
  //   updateDto: UpdateSavingsGoalDto,
  //   user: User,
  // ): Promise<SavingsGoals> {
  //   const goal = await this.findOne(id, user);
  //   Object.assign(goal, updateDto);
  //   await this.savingsGoalsRepository.save(goal);
  //   return this.findOne(id, user);
  // }

  // /** Delete a savings goal */
  // async remove(id: number, user: User): Promise<void> {
  //   const goal = await this.findOne(id, user);
  //   await this.savingsGoalsRepository.remove(goal);
  // }

  // /** Add amount to savings and create a transaction */
  // async addToSavings(
  //   goalId: number,
  //   amount: number,
  //   user: User,
  // ): Promise<SavingsGoals> {
  //   const goal = await this.findOne(goalId, user);

  //   const transactionDto: CreateTransactionDto = {
  //     type: TransactionType.EXPENSE,
  //     category: ExpenseCategory.SAVINGS_INVESTMENTS,
  //     amount,
  //     description: `Added ${amount} Tk to savings goal "${goal.name}" (Target: ${goal.targetAmount} Tk)`,
  //     date: new Date().toISOString(),
  //     savingsGoalId: goal.id,
  //   };

  //   await this.transactionsService.create(transactionDto, user);

  //   // Recalculate saved_amount based on all transactions
  //   await this.recalcSavedAmount(await this.findOne(goal.id, user));

  //   return this.findOne(goal.id, user);
  // }

  // /** Edit a transaction and recalc saved_amount */
  // async editSavingsTransaction(
  //   goalId: number,
  //   transactionId: number,
  //   newAmount: number,
  //   user: User,
  // ): Promise<SavingsGoals> {
  //   const goal = await this.findOne(goalId, user);
  //   const transaction = goal.transactions?.find((t) => t.id === transactionId);
  //   if (!transaction)
  //     throw new NotFoundException(
  //       `Transaction with ID ${transactionId} not found`,
  //     );

  //   await this.transactionsService.update(
  //     transaction.id,
  //     { amount: newAmount, date: new Date().toISOString() },
  //     user,
  //   );

  //   // Recalculate saved_amount
  //   await this.recalcSavedAmount(await this.findOne(goalId, user));

  //   return this.findOne(goalId, user);
  // }

  // /** Remove a specific transaction and recalc saved_amount */
  // async removeSavingsTransaction(
  //   goalId: number,
  //   transactionId: number,
  //   user: User,
  // ): Promise<SavingsGoals> {
  //   const goal = await this.findOne(goalId, user);
  //   const transaction = goal.transactions?.find((t) => t.id === transactionId);
  //   if (!transaction)
  //     throw new NotFoundException(
  //       `Transaction with ID ${transactionId} not found`,
  //     );

  //   await this.transactionsService.remove(transaction.id, user);

  //   // Recalculate saved_amount
  //   await this.recalcSavedAmount(await this.findOne(goalId, user));

  //   return this.findOne(goalId, user);
  // }
}
