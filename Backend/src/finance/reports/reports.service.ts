import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Reports, ReportType } from './reports.entity';
import { User } from 'src/auth/user.entity';
import { TransactionsService } from 'src/finance/transactions/transactions.service';
// import {
//   ExpenseCategory,
//   TransactionType,
// } from 'src/finance/transactions/transactions.enum';
import { BudgetsService } from 'src/finance/budgets/budgets.service';
import { SavingsGoalsService } from 'src/finance/savings-goals/savings-goals.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Reports)
    private readonly reportsRepository: Repository<Reports>,
    private readonly transactionsService: TransactionsService,
    private readonly budgetsService: BudgetsService,
    private readonly savingsGoalsService: SavingsGoalsService,
  ) {}

  /** List all reports for the current user */
  // async findAll(
  //   user: User,
  //   filters?: {
  //     month?: number;
  //     year?: number;
  //     reportType?: ReportType;
  //     half?: 1 | 2;
  //   },
  // ): Promise<Reports[]> {
  //   const query = this.reportsRepository
  //     .createQueryBuilder('report')
  //     .where('report.userId = :userId', { userId: user.id });

  //   // Filter by report type
  //   if (filters?.reportType) {
  //     query.andWhere('report.reportType = :reportType', {
  //       reportType: filters.reportType,
  //     });
  //   }

  //   // Filter by year
  //   if (filters?.year) {
  //     query.andWhere(`EXTRACT(YEAR FROM report.period_start)::int = :year`, {
  //       year: filters.year,
  //     });
  //   }

  //   // Filter by month (only for monthly reports or half-yearly)
  //   if (filters?.month && filters.reportType === ReportType.MONTHLY) {
  //     query.andWhere(`EXTRACT(MONTH FROM report.period_start)::int = :month`, {
  //       month: filters.month,
  //     });
  //   }

  //   // Filter by half-year (only for half-yearly reports)
  //   if (filters?.half && filters.reportType === ReportType.HALF_YEARLY) {
  //     if (filters.half === 1) {
  //       query.andWhere(
  //         'EXTRACT(MONTH FROM report.period_start) BETWEEN 1 AND 6',
  //       );
  //     } else {
  //       query.andWhere(
  //         'EXTRACT(MONTH FROM report.period_start) BETWEEN 7 AND 12',
  //       );
  //     }
  //   }

  //   // Order by start date descending
  //   return query.orderBy('report.periodStart', 'DESC').getMany();
  // }

  // /** Find one report */
  // async findOne(id: number, user: User): Promise<Reports> {
  //   const report = await this.reportsRepository.findOne({
  //     where: { id, user: { id: user.id } },
  //   });

  //   if (!report) throw new NotFoundException(`Report ${id} not found`);
  //   return report;
  // }

  // /** Helper: fetch all transactions for a period */
  // private async getTransactions(user: User, start: Date, end: Date) {
  //   const { data } = await this.transactionsService.findAll(user, {
  //     startDate: start.toISOString(),
  //     endDate: end.toISOString(),
  //     page: 1,
  //     limit: 100000, // assume max transactions
  //   });
  //   return data;
  // }

  // /** Generate a new report (monthly, half-yearly, yearly) */
  // async create(
  //   reportType: ReportType,
  //   user: User,
  //   month?: number, // 1-12
  //   year?: number, // full year
  //   half?: 1 | 2, // optional for half-yearly
  // ): Promise<Reports> {
  //   const now = new Date();
  //   const targetYear = year ?? now.getFullYear();

  //   // --- Generate safe YYYY-MM-DD start and end strings ---
  //   let startStr: string;
  //   let endStr: string;

  //   if (reportType === ReportType.MONTHLY) {
  //     if (!month) throw new Error('Month is required for monthly reports');
  //     const mm = month.toString().padStart(2, '0');
  //     startStr = `${targetYear}-${mm}-01`;
  //     const lastDay = new Date(targetYear, month, 0).getDate(); // last day of month
  //     endStr = `${targetYear}-${mm}-${lastDay}`;
  //   } else if (reportType === ReportType.HALF_YEARLY) {
  //     const halfValue = half ?? 1;
  //     const startMonth = halfValue === 1 ? 1 : 7;
  //     const endMonth = halfValue === 1 ? 6 : 12;
  //     const startMonthStr = startMonth.toString().padStart(2, '0');
  //     const endMonthStr = endMonth.toString().padStart(2, '0');
  //     startStr = `${targetYear}-${startMonthStr}-01`;
  //     const lastDay = new Date(targetYear, endMonth, 0).getDate();
  //     endStr = `${targetYear}-${endMonthStr}-${lastDay}`;
  //   } else {
  //     // YEARLY
  //     startStr = `${targetYear}-01-01`;
  //     endStr = `${targetYear}-12-31`;
  //   }
  //   console.log('this is it ', startStr);
  //   // --- Fetch transactions within period ---
  //   const transactions = await this.getTransactions(
  //     user,
  //     new Date(startStr),
  //     new Date(endStr),
  //   );

  //   const totalIncome = transactions
  //     .filter((t) => t.type === TransactionType.INCOME)
  //     .reduce((sum, t) => sum + Number(t.amount), 0);

  //   const totalExpense = transactions
  //     .filter((t) => t.type === TransactionType.EXPENSE)
  //     .reduce((sum, t) => sum + Number(t.amount), 0);

  //   // --- Fetch budgets & savings goals ---
  //   const { data: budgets } = await this.budgetsService.findAll(user, {
  //     month,
  //     year: targetYear,
  //     page: 1,
  //     limit: 1000,
  //   });

  //   const { data: savingsGoals } = await this.savingsGoalsService.findAll(
  //     user,
  //     {
  //       month,
  //       year: targetYear,
  //       page: 1,
  //       limit: 1000,
  //     },
  //   );

  //   // --- Group by category ---
  //   const groupByCategory = (items: any[], type: TransactionType) => {
  //     const grouped: Record<string, number> = {};
  //     items
  //       .filter((t) => t.type === type)
  //       .forEach(
  //         (t) =>
  //           (grouped[t.category] =
  //             (grouped[t.category] ?? 0) + Number(t.amount)),
  //       );
  //     return Object.entries(grouped).map(([category, amount]) => ({
  //       category,
  //       amount,
  //       percentage: +(
  //         (amount /
  //           (type === TransactionType.INCOME ? totalIncome : totalExpense)) *
  //           100 || 0
  //       ).toFixed(2),
  //     }));
  //   };

  //   const incomeByCategory = groupByCategory(
  //     transactions,
  //     TransactionType.INCOME,
  //   );
  //   const expensesByCategory = groupByCategory(
  //     transactions,
  //     TransactionType.EXPENSE,
  //   );

  //   // --- Group by period (trend) ---
  //   const groupByPeriod = (items: any[], type: TransactionType) => {
  //     const grouped: Record<string, number> = {};
  //     items
  //       .filter((t) => t.type === type)
  //       .forEach((t) => {
  //         const periodKey =
  //           reportType === ReportType.MONTHLY
  //             ? t.date // already safe YYYY-MM-DD
  //             : `${new Date(t.date).getMonth() + 1}-${new Date(t.date).getFullYear()}`;
  //         grouped[periodKey] = (grouped[periodKey] ?? 0) + Number(t.amount);
  //       });
  //     return Object.entries(grouped).map(([period, amount]) => ({
  //       period,
  //       amount,
  //     }));
  //   };

  //   const incomeTrend = groupByPeriod(transactions, TransactionType.INCOME);
  //   const expenseTrend = groupByPeriod(transactions, TransactionType.EXPENSE);

  //   // --- Budgets by category ---
  //   const budgetsByCategory = budgets.map((b) => {
  //     const spent = transactions
  //       .filter((t) => t.category === b.category)
  //       .reduce((sum, t) => sum + Number(t.amount), 0);
  //     return {
  //       category: b.category,
  //       budgeted: Number(b.amount),
  //       spent,
  //       percentageUsed: +(b.amount
  //         ? ((spent / Number(b.amount)) * 100).toFixed(2)
  //         : 0),
  //     };
  //   });

  //   const overallBudgeted = budgets.reduce(
  //     (sum, b) => sum + Number(b.amount),
  //     0,
  //   );
  //   const overallSpent = transactions
  //     .filter((t) => budgets.some((b) => b.category === t.category))
  //     .reduce((sum, t) => sum + Number(t.amount), 0);

  //   // --- Calculate savedAmount for savings goals ---
  //   savingsGoals.forEach((g) => {
  //     g.savedAmount =
  //       g.transactions
  //         ?.filter(
  //           (t) =>
  //             t.category === ExpenseCategory.SAVINGS_INVESTMENTS &&
  //             t.type === TransactionType.EXPENSE,
  //         )
  //         .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;
  //   });

  //   // --- Assemble report data ---
  //   const reportData = {
  //     period: { type: reportType, start: startStr, end: endStr },
  //     summary: {
  //       totalIncome,
  //       totalExpense,
  //       netSavings: totalIncome - totalExpense,
  //       budgetedAmount: overallBudgeted,
  //       budgetDifference: overallBudgeted - overallSpent,
  //       savingsProgress: savingsGoals[0]
  //         ? {
  //             targetAmount: Number(savingsGoals[0].targetAmount ?? 0),
  //             savedAmount: Number(savingsGoals[0].savedAmount ?? 0),
  //             percentage: savingsGoals[0].targetAmount
  //               ? +(
  //                   (Number(savingsGoals[0].savedAmount ?? 0) /
  //                     Number(savingsGoals[0].targetAmount)) *
  //                   100
  //                 ).toFixed(2)
  //               : 0,
  //           }
  //         : null,
  //     },
  //     income: { byCategory: incomeByCategory, trend: incomeTrend },
  //     expenses: { byCategory: expensesByCategory, trend: expenseTrend },
  //     budgets: {
  //       byCategory: budgetsByCategory,
  //       overallUsage: {
  //         budgeted: overallBudgeted,
  //         spent: overallSpent,
  //         percentageUsed: overallBudgeted
  //           ? +((overallSpent / overallBudgeted) * 100).toFixed(2)
  //           : 0,
  //       },
  //     },
  //     savingsGoals: savingsGoals.map((g) => {
  //       const dueDate = g.dueDate ? new Date(g.dueDate) : null;
  //       const saved = Number(g.savedAmount ?? 0);
  //       const target = Number(g.targetAmount ?? 0);
  //       let status: 'inProgress' | 'completed' | 'overdue' = 'inProgress';
  //       if (saved >= target && target > 0) status = 'completed';
  //       else if (dueDate && dueDate < new Date()) status = 'overdue';
  //       return {
  //         goalName: g.name ?? 'Unnamed Goal',
  //         targetAmount: target,
  //         savedAmount: saved,
  //         percentage: target ? +((saved / target) * 100).toFixed(2) : 0,
  //         dueDate: dueDate ? dueDate.toISOString().split('T')[0] : null,
  //         status,
  //       };
  //     }),
  //   };

  //   // --- Save report ---
  //   const report = this.reportsRepository.create({
  //     reportType,
  //     periodStart: startStr,
  //     periodEnd: endStr,
  //     data: reportData,
  //     user,
  //   });

  //   return await this.reportsRepository.save(report);
  // }

  // async update(reportId: number, user: User): Promise<Reports> {
  //   // 1. Find the existing report
  //   const report = await this.reportsRepository.findOne({
  //     where: { id: reportId, user: { id: user.id } },
  //   });
  //   if (!report) throw new NotFoundException(`Report ${reportId} not found`);

  //   // 2. Determine start & end from the existing report
  //   const start = new Date(report.periodStart);
  //   const end = new Date(report.periodEnd);

  //   // 3. Fetch transactions, budgets, and savings goals for that period
  //   const transactions = await this.getTransactions(user, start, end);

  //   const { data: budgets } = await this.budgetsService.findAll(user, {
  //     month: start.getMonth() + 1, // for monthly budgets
  //     year: start.getFullYear(),
  //     page: 1,
  //     limit: 1000,
  //   });

  //   const { data: savingsGoals } = await this.savingsGoalsService.findAll(
  //     user,
  //     {
  //       month: start.getMonth() + 1, // for monthly savings goals
  //       year: start.getFullYear(),
  //       page: 1,
  //       limit: 1000,
  //     },
  //   );

  //   // 4. Recompute the report data
  //   const totalIncome = transactions
  //     .filter((t) => t.type === TransactionType.INCOME)
  //     .reduce((sum, t) => sum + Number(t.amount), 0);

  //   const totalExpense = transactions
  //     .filter((t) => t.type === TransactionType.EXPENSE)
  //     .reduce((sum, t) => sum + Number(t.amount), 0);

  //   // --- Group by category ---
  //   const groupByCategory = (items: any[], type: TransactionType) => {
  //     const grouped: Record<string, number> = {};
  //     items
  //       .filter((t) => t.type === type)
  //       .forEach((t) => {
  //         grouped[t.category] = (grouped[t.category] ?? 0) + Number(t.amount);
  //       });
  //     return Object.entries(grouped).map(([category, amount]) => ({
  //       category,
  //       amount,
  //       percentage: +(
  //         (amount /
  //           (type === TransactionType.INCOME ? totalIncome : totalExpense)) *
  //           100 || 0
  //       ).toFixed(2),
  //     }));
  //   };

  //   const incomeByCategory = groupByCategory(
  //     transactions,
  //     TransactionType.INCOME,
  //   );
  //   const expensesByCategory = groupByCategory(
  //     transactions,
  //     TransactionType.EXPENSE,
  //   );

  //   // --- Trends ---
  //   const groupByPeriod = (items: any[], type: TransactionType) => {
  //     const grouped: Record<string, number> = {};
  //     items
  //       .filter((t) => t.type === type)
  //       .forEach((t) => {
  //         const periodKey =
  //           report.reportType === ReportType.MONTHLY
  //             ? new Date(t.date).toISOString().split('T')[0] // daily breakdown
  //             : `${new Date(t.date).getMonth() + 1}-${new Date(
  //                 t.date,
  //               ).getFullYear()}`;
  //         grouped[periodKey] = (grouped[periodKey] ?? 0) + Number(t.amount);
  //       });
  //     return Object.entries(grouped).map(([period, amount]) => ({
  //       period,
  //       amount,
  //     }));
  //   };

  //   const incomeTrend = groupByPeriod(transactions, TransactionType.INCOME);
  //   const expenseTrend = groupByPeriod(transactions, TransactionType.EXPENSE);

  //   // --- Budgets by category ---
  //   const budgetsByCategory = budgets.map((b) => {
  //     const spent = transactions
  //       .filter((t) => t.category === b.category)
  //       .reduce((sum, t) => sum + Number(t.amount), 0);
  //     return {
  //       category: b.category,
  //       budgeted: Number(b.amount),
  //       spent,
  //       percentageUsed: b.amount
  //         ? +((spent / Number(b.amount)) * 100).toFixed(2)
  //         : 0,
  //     };
  //   });

  //   const overallBudgeted = budgets.reduce(
  //     (sum, b) => sum + Number(b.amount),
  //     0,
  //   );
  //   const overallSpent = transactions
  //     .filter((t) => budgets.some((b) => b.category === t.category))
  //     .reduce((sum, t) => sum + Number(t.amount), 0);

  //   // --- Savings goals ---
  //   savingsGoals.forEach((g) => {
  //     g.savedAmount =
  //       g.transactions
  //         ?.filter(
  //           (t) =>
  //             t.category === ExpenseCategory.SAVINGS_INVESTMENTS &&
  //             t.type === TransactionType.EXPENSE,
  //         )
  //         .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;
  //   });

  //   const reportData = {
  //     period: report.data.period, // keep original period info
  //     summary: {
  //       totalIncome,
  //       totalExpense,
  //       netSavings: totalIncome - totalExpense,
  //       budgetedAmount: overallBudgeted,
  //       budgetDifference: overallBudgeted - overallSpent,
  //       savingsProgress: savingsGoals[0]
  //         ? {
  //             targetAmount: Number(savingsGoals[0].targetAmount ?? 0),
  //             savedAmount: Number(savingsGoals[0].savedAmount ?? 0),
  //             percentage: savingsGoals[0].targetAmount
  //               ? +(
  //                   (Number(savingsGoals[0].savedAmount ?? 0) /
  //                     Number(savingsGoals[0].targetAmount)) *
  //                   100
  //                 ).toFixed(2)
  //               : 0,
  //           }
  //         : null,
  //     },
  //     income: { byCategory: incomeByCategory, trend: incomeTrend },
  //     expenses: { byCategory: expensesByCategory, trend: expenseTrend },
  //     budgets: {
  //       byCategory: budgetsByCategory,
  //       overallUsage: {
  //         budgeted: overallBudgeted,
  //         spent: overallSpent,
  //         percentageUsed: overallBudgeted
  //           ? +((overallSpent / overallBudgeted) * 100).toFixed(2)
  //           : 0,
  //       },
  //     },
  //     savingsGoals: savingsGoals.map((g) => {
  //       const dueDate = g.dueDate ? new Date(g.dueDate) : null;
  //       const saved = Number(g.savedAmount ?? 0);
  //       const target = Number(g.targetAmount ?? 0);
  //       let status: 'inProgress' | 'completed' | 'overdue' = 'inProgress';
  //       if (saved >= target && target > 0) status = 'completed';
  //       else if (dueDate && dueDate < new Date()) status = 'overdue';
  //       return {
  //         goalName: g.name,
  //         targetAmount: target,
  //         savedAmount: saved,
  //         percentage: target ? +((saved / target) * 100).toFixed(2) : 0,
  //         dueDate: dueDate ? dueDate.toISOString().split('T')[0] : null,
  //         status,
  //       };
  //     }),
  //   };

  //   // 5. Update the report
  //   report.data = reportData;
  //   return this.reportsRepository.save(report);
  // }

  // async remove(id: number, user: User): Promise<void> {
  //   const report = await this.findOne(id, user);
  //   await this.reportsRepository.remove(report);
  // }

  // /** Helper: group by type + category */
  // private groupByTypeAndCategory(transactions: any[]) {
  //   const grouped: Record<string, Record<string, number>> = {
  //     income: {},
  //     expense: {},
  //   };

  //   transactions.forEach((t) => {
  //     const type = t.type.toLowerCase();
  //     if (type !== 'income' && type !== 'expense') return;

  //     grouped[type][t.category] =
  //       (grouped[type][t.category] ?? 0) + Number(t.amount);
  //   });

  //   return grouped;
  // }

  // async topCategories(user: User, month?: number, year?: number) {
  //   const targetYear = year ?? new Date().getFullYear();

  //   let startStr: string;
  //   let endStr: string;

  //   if (month) {
  //     const mm = month.toString().padStart(2, '0');
  //     startStr = `${targetYear}-${mm}-01`;
  //     const lastDay = new Date(targetYear, month, 0).getDate();
  //     endStr = `${targetYear}-${mm}-${lastDay}`;
  //   } else {
  //     startStr = `${targetYear}-01-01`;
  //     endStr = `${targetYear}-12-31`;
  //   }

  //   const transactions = await this.getTransactions(
  //     user,
  //     new Date(startStr),
  //     new Date(endStr),
  //   );

  //   // ✅ use new helper
  //   const grouped = this.groupByTypeAndCategory(transactions);
  //   console.log('Grouped transactions:', grouped);

  //   const topExpenses = Object.entries(grouped.expense)
  //     .sort(([, a], [, b]) => b - a)
  //     .slice(0, 3)
  //     .map(([category, total]) => ({ category, total }));

  //   const topIncomes = Object.entries(grouped.income)
  //     .sort(([, a], [, b]) => b - a)
  //     .slice(0, 3)
  //     .map(([category, total]) => ({ category, total }));

  //   return { topExpenses, topIncomes };
  // }

  // /** Category charts (pie/bar data) */
  // /** Category charts (pie/bar data) */
  // async categoryCharts(user: User, month?: number, year?: number) {
  //   const start = new Date(
  //     year ?? new Date().getFullYear(),
  //     (month ?? 1) - 1,
  //     1,
  //   );
  //   const end = new Date(year ?? new Date().getFullYear(), month ?? 12, 31);

  //   const transactions = await this.getTransactions(user, start, end);

  //   // ✅ use unified grouping
  //   const grouped = this.groupByTypeAndCategory(transactions);

  //   return {
  //     expenses: Object.entries(grouped.expense).map(([category, value]) => ({
  //       category,
  //       value,
  //     })),
  //     incomes: Object.entries(grouped.income).map(([category, value]) => ({
  //       category,
  //       value,
  //     })),
  //   };
  // }
}
