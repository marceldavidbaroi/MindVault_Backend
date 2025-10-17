import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Transactions } from 'src/finance/transactions/transactions.entity';
// ⚡ Imported actual entity classes
import { MonthlyCategorySummary } from './category_monthly_summary.entity';
import { DailySummary } from './daily_summary.entity';
import { MonthlySummary } from './monthly_summary.entity';
import { GenerateReportDto } from './dto/filter-summary.dto';

// ⚡ Renamed local interfaces to avoid conflict with the imported entity names
interface IDailySummary {
  id: number;
  userId: number;
  date: Date;
  totalIncome: number;
  totalExpense: number;
}
interface IMonthlySummary {
  id: number;
  userId: number;
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  netSavingsRate: number;
}

@Injectable()
export class SummaryService {
  private readonly logger = new Logger(SummaryService.name);

  constructor(
    @InjectRepository(Transactions)
    private transactionsRepository: Repository<Transactions>,
    // ⚡ Injecting the actual imported entity class (DailySummary)
    @InjectRepository(DailySummary)
    private dailySummaryRepository: Repository<DailySummary>,
    // ⚡ Injecting the actual imported entity class (MonthlySummary)
    @InjectRepository(MonthlySummary)
    private monthlySummaryRepository: Repository<MonthlySummary>,
    @InjectRepository(MonthlyCategorySummary)
    private monthlyCategorySummaryRepository: Repository<MonthlyCategorySummary>,
  ) {}

  /**
   * Main handler for transaction changes (create, update, delete).
   * Triggers the necessary recalculations for all affected periods and categories.
   */
  async handleTransactionChange(
    oldTxn?: Transactions,
    newTxn?: Transactions,
  ): Promise<void> {
    try {
      const targetTxn = newTxn || oldTxn;
      // Access user ID via the relation object's ID
      const userId = targetTxn?.user?.id;

      if (!userId) {
        this.logger.warn(
          'handleTransactionChange called without valid user context.',
        );
        return;
      }

      const affectedKeys: {
        date: string;
        year: number;
        month: number;
        categoryId: number;
        type: 'income' | 'expense';
      }[] = [];

      const extractKeys = (txn: Transactions) => {
        // ⚡ Acknowledge that txn.date is a string as defined in the entity
        const dateString = txn.date;

        // Use a Date object to safely extract year and month from the date string
        const dateObject = new Date(dateString);

        return {
          date: dateString,
          year: dateObject.getFullYear(),
          month: dateObject.getMonth() + 1, // 1-12
          categoryId: txn.category?.id,
          type: txn.type,
        };
      };

      // Keys from the old state (for update/delete)
      if (oldTxn) {
        affectedKeys.push(extractKeys(oldTxn));
      }

      // Keys from the new state (for create/update)
      if (newTxn) {
        const newKeys = extractKeys(newTxn);
        const oldKeys = oldTxn ? extractKeys(oldTxn) : null;

        // Check for duplicates based on old state keys
        const isDuplicate =
          oldTxn &&
          newKeys.date === oldKeys?.date &&
          newKeys.categoryId === oldKeys?.categoryId;

        if (!isDuplicate) {
          affectedKeys.push(newKeys);
        }
      }

      // Filter for unique keys
      const uniqueKeys = Array.from(
        new Set(affectedKeys.map((k) => JSON.stringify(k))),
      ).map((s) => JSON.parse(s));

      // 2. Process all unique affected keys
      for (const key of uniqueKeys) {
        if (!key.categoryId) {
          this.logger.error(
            `Skipping summary update: Transaction missing categoryId for key: ${JSON.stringify(key)}`,
          );
          continue;
        }

        // Daily and Monthly summary
        await this.updateDailySummary(key.date, userId);
        await this.updateMonthlySummary(key.year, key.month, userId);

        // Category Monthly Summary
        await this.updateCategoryMonthlySummary(
          key.year,
          key.month,
          key.categoryId,
          key.type,
          userId,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error processing transaction change: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to update financial summaries. Consistency lost.',
      );
    }
  }

  private async updateDailySummary(dateStr: string, userId: number) {
    const totalResult = await this.transactionsRepository
      .createQueryBuilder('t')
      .select(
        'SUM(CASE WHEN t.type = :income THEN t.amount ELSE 0 END)',
        'total_income',
      )
      .addSelect(
        'SUM(CASE WHEN t.type = :expense THEN t.amount ELSE 0 END)',
        'total_expense',
      )
      .where('t.user_id = :userId', { userId })
      .andWhere('t.date = :date', { date: dateStr })
      .setParameters({ income: 'income', expense: 'expense' })
      .getRawOne();

    await this.dailySummaryRepository
      .createQueryBuilder()
      .insert()
      .into(DailySummary)
      .values({
        user: { id: userId },
        date: dateStr,
        totalIncome: (parseFloat(totalResult.total_income) || 0).toFixed(2),
        totalExpense: (parseFloat(totalResult.total_expense) || 0).toFixed(2),
      })
      .onConflict(
        `("user_id", "date") DO UPDATE SET 
      "total_income" = EXCLUDED."total_income",
      "total_expense" = EXCLUDED."total_expense"`,
      )
      .execute();
  }

  private async updateMonthlySummary(
    year: number,
    month: number,
    userId: number,
  ) {
    const monthStart = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const monthEnd = new Date(nextYear, nextMonth - 1, 1)
      .toISOString()
      .split('T')[0];

    const totalResult = await this.transactionsRepository
      .createQueryBuilder('t')
      .select(
        'SUM(CASE WHEN t.type = :income THEN t.amount ELSE 0 END)',
        'total_income',
      )
      .addSelect(
        'SUM(CASE WHEN t.type = :expense THEN t.amount ELSE 0 END)',
        'total_expense',
      )
      .where('t.user_id = :userId', { userId })
      .andWhere('t.date >= :monthStart', { monthStart })
      .andWhere('t.date < :monthEnd', { monthEnd })
      .setParameters({ income: 'income', expense: 'expense' })
      .getRawOne();

    const totalIncome = parseFloat(totalResult.total_income) || 0;
    const totalExpense = parseFloat(totalResult.total_expense) || 0;

    await this.monthlySummaryRepository
      .createQueryBuilder()
      .insert()
      .into(MonthlySummary)
      .values({
        user: { id: userId },
        year,
        month,
        totalIncome: totalIncome.toFixed(2),
        totalExpense: totalExpense.toFixed(2),
      })
      .onConflict(
        `("user_id", "year", "month") DO UPDATE SET 
      "total_income" = EXCLUDED."total_income",
      "total_expense" = EXCLUDED."total_expense"`,
      )
      .execute();
  }

  private async updateCategoryMonthlySummary(
    year: number,
    month: number,
    categoryId: number,
    type: 'income' | 'expense',
    userId: number,
  ) {
    const monthStart = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const monthEnd = new Date(nextYear, nextMonth - 1, 1)
      .toISOString()
      .split('T')[0];

    const totalResult = await this.transactionsRepository
      .createQueryBuilder('t')
      .select('SUM(t.amount)', 'total_amount')
      .where('t.user_id = :userId', { userId })
      .andWhere('t.category_id = :categoryId', { categoryId })
      .andWhere('t.type = :type', { type })
      .andWhere('t.date >= :monthStart', { monthStart })
      .andWhere('t.date < :monthEnd', { monthEnd })
      .getRawOne();

    await this.monthlyCategorySummaryRepository
      .createQueryBuilder()
      .insert()
      .into(MonthlyCategorySummary)
      .values({
        user: { id: userId },
        year,
        month,
        category: { id: categoryId },
        type,
        totalAmount: (parseFloat(totalResult.total_amount) || 0).toFixed(2),
      })
      .onConflict(
        `("user_id", "year", "month", "category_id", "type") DO UPDATE SET 
      "total_amount" = EXCLUDED."total_amount"`,
      )
      .execute();
  }
  async generateReport(userId: number, dto: GenerateReportDto) {
    const { detailLevel, startDate, endDate } = dto;
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;

    const report: any = {
      dailySummaries: [],
      monthlySummaries: [],
      categoryMonthlySummaries: [],
      yearlySummary: null,
    };

    // Helper functions
    const getYearMonthDays = (date: Date) => ({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    });

    const addDailySummary = async (date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      const daily = await this.dailySummaryRepository.findOne({
        where: { user: { id: userId }, date: dateStr },
      });
      if (daily) report.dailySummaries.push(daily);
    };

    const addMonthlySummary = async (year: number, month: number) => {
      const monthly = await this.monthlySummaryRepository.findOne({
        where: { user: { id: userId }, year, month },
      });
      if (monthly) report.monthlySummaries.push(monthly);

      const categories = await this.monthlyCategorySummaryRepository.find({
        where: { user: { id: userId }, year, month },
      });
      report.categoryMonthlySummaries.push(...categories);
    };

    const addYearlySummary = async (year: number) => {
      const months = await this.monthlySummaryRepository.find({
        where: { user: { id: userId }, year },
      });
      const totalIncome = months.reduce(
        (sum, m) => sum + parseFloat(m.totalIncome),
        0,
      );
      const totalExpense = months.reduce(
        (sum, m) => sum + parseFloat(m.totalExpense),
        0,
      );
      report.yearlySummary = { year, totalIncome, totalExpense };
    };

    // Main logic
    if (detailLevel === 'daily' || detailLevel === 'detailed') {
      let current = new Date(start);
      while (current <= end) {
        await addDailySummary(current);
        const { year, month } = getYearMonthDays(current);
        await addMonthlySummary(year, month);
        current.setDate(current.getDate() + 1);
      }
      const years = Array.from(
        new Set([start.getFullYear(), end.getFullYear()]),
      );
      for (const y of years) await addYearlySummary(y);
    } else if (detailLevel === 'monthly') {
      let current = new Date(start);
      while (current <= end) {
        const { year, month } = getYearMonthDays(current);
        await addMonthlySummary(year, month);
        current.setMonth(current.getMonth() + 1);
      }
      const years = Array.from(
        new Set([start.getFullYear(), end.getFullYear()]),
      );
      for (const y of years) await addYearlySummary(y);
    } else if (detailLevel === 'yearly') {
      let currentYear = start.getFullYear();
      const endYear = end.getFullYear();
      while (currentYear <= endYear) {
        for (let month = 1; month <= 12; month++) {
          await addMonthlySummary(currentYear, month);
        }
        await addYearlySummary(currentYear);
        currentYear++;
      }
    }

    return report;
  }

  async getTransactionDashboardSummary(userId: number) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const thisMonth = today.getMonth() + 1;
    const thisYear = today.getFullYear();

    const prevMonth = thisMonth === 1 ? 12 : thisMonth - 1;
    const prevMonthYear = thisMonth === 1 ? thisYear - 1 : thisYear;

    // --- Daily summaries
    const dailySummary = await this.dailySummaryRepository.findOne({
      where: { user: { id: userId }, date: today.toISOString().split('T')[0] },
    });

    const prevDailySummary = await this.dailySummaryRepository.findOne({
      where: {
        user: { id: userId },
        date: yesterday.toISOString().split('T')[0],
      },
    });

    // --- Monthly summaries
    const monthlySummary = await this.monthlySummaryRepository.findOne({
      where: { user: { id: userId }, year: thisYear, month: thisMonth },
    });

    const prevMonthlySummary = await this.monthlySummaryRepository.findOne({
      where: { user: { id: userId }, year: prevMonthYear, month: prevMonth },
    });

    // --- Yearly summaries
    const yearlySummaries = await this.monthlySummaryRepository.find({
      where: { user: { id: userId }, year: thisYear },
    });

    const prevYearlySummaries = await this.monthlySummaryRepository.find({
      where: { user: { id: userId }, year: thisYear - 1 },
    });

    const totalYearIncome = yearlySummaries.reduce(
      (sum, m) => sum + parseFloat(m.totalIncome),
      0,
    );
    const totalYearExpense = yearlySummaries.reduce(
      (sum, m) => sum + parseFloat(m.totalExpense),
      0,
    );

    const prevYearIncome = prevYearlySummaries.reduce(
      (sum, m) => sum + parseFloat(m.totalIncome),
      0,
    );
    const prevYearExpense = prevYearlySummaries.reduce(
      (sum, m) => sum + parseFloat(m.totalExpense),
      0,
    );

    // --- Weekly spending (Mon–Sun) from DailySummary
    const startOfWeek = new Date(today);
    const currentDay = startOfWeek.getDay(); // 0 = Sun, 1 = Mon
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    startOfWeek.setDate(startOfWeek.getDate() + mondayOffset);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const dailySummaries = await this.dailySummaryRepository.find({
      where: {
        user: { id: userId },
        date: Between(
          startOfWeek.toISOString().split('T')[0],
          endOfWeek.toISOString().split('T')[0],
        ),
      },
      order: { date: 'ASC' },
    });

    const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekMap = new Map<string, number>();

    dailySummaries.forEach((daySummary) => {
      const d = new Date(daySummary.date);
      const day = dayOrder[d.getDay() === 0 ? 6 : d.getDay() - 1]; // JS Sun=0 → Sun=6
      const amount = Number(daySummary.totalExpense || 0);
      weekMap.set(day, amount);
    });

    const weeklyBreakdown = dayOrder.map((day) => ({
      day,
      amount: weekMap.get(day) || 0,
    }));

    const weeklyTotalSpending = weeklyBreakdown.reduce(
      (sum, d) => sum + d.amount,
      0,
    );

    // --- Total remaining income
    const totalRemainingIncomeAllTimeData =
      await this.monthlyCategorySummaryRepository
        .createQueryBuilder('mcs')
        .select('SUM(mcs.total_amount)', 'totalRemaining')
        .where('mcs.user_id = :userId', { userId }) // <-- fix here
        .andWhere('mcs.type = :type', { type: 'income' })
        .getRawOne();

    const totalRemainingIncomeThisMonthData =
      await this.monthlyCategorySummaryRepository
        .createQueryBuilder('mcs')
        .select('SUM(mcs.total_amount)', 'totalRemaining')
        .where('mcs.user_id = :userId', { userId }) // <-- fix here
        .andWhere('mcs.year = :year', { year: thisYear })
        .andWhere('mcs.month = :month', { month: thisMonth })
        .andWhere('mcs.type = :type', { type: 'income' })
        .getRawOne();

    const totalRemainingIncomeAllTime = Number(
      totalRemainingIncomeAllTimeData?.totalRemaining || 0,
    );
    const totalRemainingIncomeThisMonth = Number(
      totalRemainingIncomeThisMonthData?.totalRemaining || 0,
    );

    // --- Recent transactions (limit 5)
    const recentTransactions = await this.transactionsRepository.find({
      where: { user: { id: userId } },
      order: { date: 'DESC' },
      take: 5,
      relations: ['category'],
    });

    return {
      summary: [
        {
          title: 'Today',
          type: 'today',
          income: Number(dailySummary?.totalIncome || 0),
          expense: Number(dailySummary?.totalExpense || 0),
          prevIncome: Number(prevDailySummary?.totalIncome || 0),
          prevExpense: Number(prevDailySummary?.totalExpense || 0),
        },
        {
          title: 'This Month',
          type: 'month',
          income: Number(monthlySummary?.totalIncome || 0),
          expense: Number(monthlySummary?.totalExpense || 0),
          prevIncome: Number(prevMonthlySummary?.totalIncome || 0),
          prevExpense: Number(prevMonthlySummary?.totalExpense || 0),
        },
        {
          title: 'This Year',
          type: 'year',
          income: totalYearIncome,
          expense: totalYearExpense,
          prevIncome: prevYearIncome,
          prevExpense: prevYearExpense,
        },
      ],
      weekly: {
        totalSpending: weeklyTotalSpending,
        breakdown: weeklyBreakdown,
      },
      totalRemainingIncomeAllTime,
      totalRemainingIncomeThisMonth,
      recentTransactions,
    };
  }
}
