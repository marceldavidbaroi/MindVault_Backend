import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DailySummary } from '../entity/daily-summary.entity';
import { MonthlySummary } from '../entity/monthly-summary.entity';
import { WeeklySummary } from '../entity/weekly-summary.entity';
import { YearlySummary } from '../entity/yearly-summary.entity';

import dayjs from 'dayjs';
import { Transaction } from 'src/finance/transactions/entities/transaction.entity';
import { MonthlyCategorySummary } from '../entity/monthly-category-summary.entity';
import { DailyCategorySummary } from '../entity/daily-category-summary.entity';

@Injectable()
export class SummaryWorkerService {
  private readonly logger = new Logger(SummaryWorkerService.name);

  constructor(
    @InjectRepository(DailySummary)
    private readonly dailySummaryRepo: Repository<DailySummary>,
    @InjectRepository(MonthlySummary)
    private readonly monthlySummaryRepo: Repository<MonthlySummary>,
    @InjectRepository(WeeklySummary)
    private readonly weeklySummaryRepo: Repository<WeeklySummary>,
    @InjectRepository(YearlySummary)
    private readonly yearlySummaryRepo: Repository<YearlySummary>,
    @InjectRepository(MonthlyCategorySummary)
    private readonly monthlyCategorySummaryRepo: Repository<MonthlyCategorySummary>,
    @InjectRepository(DailyCategorySummary)
    private readonly dailyCategorySummaryRepo: Repository<DailyCategorySummary>,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    private readonly dataSource: DataSource,
  ) {}

  /** ---------------------------------------
   * WEEK START
   ---------------------------------------- */
  private getWeekStart(date: dayjs.Dayjs) {
    return date.startOf('week').format('YYYY-MM-DD'); // Monday start
  }

  /** ---------------------------------------
   * CREATE SUMMARY (existing)
   ---------------------------------------- */
  async handleTransaction(transaction: Transaction) {
    const { account, amount, transactionDate, type, category } = transaction;

    const decimalAmount = parseFloat(amount);
    if (isNaN(decimalAmount)) {
      this.logger.error(
        `Invalid transaction amount: ${amount} for transaction ${transaction.id}`,
      );
      return;
    }

    const date = dayjs(transactionDate);
    const year = date.year();
    const month = date.month() + 1;
    const day = date.format('YYYY-MM-DD');
    const weekStart = this.getWeekStart(date);

    await this.dataSource.transaction(async (manager) => {
      await this.applySummaryDelta(manager, {
        accountId: account.id,
        day,
        weekStart,
        month,
        year,
        type,
        categoryId: category?.id || null,
        delta: decimalAmount,
      });
    });

    this.logger.log(`Updated all summaries for transaction ${transaction.id}`);
  }

  /** ---------------------------------------
   * UPDATE SUMMARY
   ---------------------------------------- */
  async handleTransactionUpdate(oldTx: Transaction, newTx: Transaction) {
    const oldAmount = parseFloat(oldTx.amount);
    const newAmount = parseFloat(newTx.amount);

    const oldDate = dayjs(oldTx.transactionDate);
    const newDate = dayjs(newTx.transactionDate);

    const oldYear = oldDate.year();
    const newYear = newDate.year();

    const oldMonth = oldDate.month() + 1;
    const newMonth = newDate.month() + 1;

    const oldDay = oldDate.format('YYYY-MM-DD');
    const newDay = newDate.format('YYYY-MM-DD');

    const oldWeekStart = this.getWeekStart(oldDate);
    const newWeekStart = this.getWeekStart(newDate);

    const oldCategoryId = oldTx.category?.id || null;
    const newCategoryId = newTx.category?.id || null;

    const oldAccountId = oldTx.account.id;
    const newAccountId = newTx.account.id;

    await this.dataSource.transaction(async (manager) => {
      // STEP 1: Reverse old effect
      await this.applySummaryDelta(manager, {
        accountId: oldAccountId,
        day: oldDay,
        weekStart: oldWeekStart,
        month: oldMonth,
        year: oldYear,
        type: oldTx.type,
        categoryId: oldCategoryId,
        delta: -oldAmount,
      });

      // STEP 2: Apply new effect
      await this.applySummaryDelta(manager, {
        accountId: newAccountId,
        day: newDay,
        weekStart: newWeekStart,
        month: newMonth,
        year: newYear,
        type: newTx.type,
        categoryId: newCategoryId,
        delta: newAmount,
      });
    });

    this.logger.log(`Updated summaries for updated transaction ${newTx.id}`);
  }

  /** ---------------------------------------
   * DELETE SUMMARY
   ---------------------------------------- */
  async handleTransactionDelete(transaction: Transaction) {
    const amount = parseFloat(transaction.amount);

    const date = dayjs(transaction.transactionDate);
    const year = date.year();
    const month = date.month() + 1;
    const day = date.format('YYYY-MM-DD');
    const weekStart = this.getWeekStart(date);

    const categoryId = transaction.category?.id || null;

    await this.dataSource.transaction(async (manager) => {
      await this.applySummaryDelta(manager, {
        accountId: transaction.account.id,
        day,
        weekStart,
        month,
        year,
        type: transaction.type,
        categoryId,
        delta: -amount,
      });
    });

    this.logger.log(
      `Removed summaries for deleted transaction ${transaction.id}`,
    );
  }

  /** ---------------------------------------
   * SHARED SUMMARY DELTA APPLYING
   ---------------------------------------- */
  private async applySummaryDelta(
    manager: any,
    {
      accountId,
      day,
      weekStart,
      month,
      year,
      type,
      categoryId,
      delta,
    }: {
      accountId: number;
      day: string;
      weekStart: string;
      month: number;
      year: number;
      type: 'income' | 'expense';
      categoryId: number | null;
      delta: number;
    },
  ) {
    const account = { id: accountId };

    /** ---------------- DAILY ---------------- */
    let daily = await manager.findOne(DailySummary, {
      where: { date: day, account },
    });
    if (!daily) {
      daily = manager.create(DailySummary, {
        account,
        date: day,
        totalIncome: '0',
        totalExpense: '0',
      });
    }
    if (type === 'income') {
      daily.totalIncome = (parseFloat(daily.totalIncome) + delta).toFixed(2);
    } else {
      daily.totalExpense = (parseFloat(daily.totalExpense) + delta).toFixed(2);
    }
    await manager.save(daily);

    /** ---------------- WEEKLY ---------------- */
    let weekly = await manager.findOne(WeeklySummary, {
      where: { weekStart, account },
    });
    if (!weekly) {
      weekly = manager.create(WeeklySummary, {
        account,
        weekStart,
        totalIncome: '0',
        totalExpense: '0',
      });
    }
    if (type === 'income') {
      weekly.totalIncome = (parseFloat(weekly.totalIncome) + delta).toFixed(2);
    } else {
      weekly.totalExpense = (parseFloat(weekly.totalExpense) + delta).toFixed(
        2,
      );
    }
    await manager.save(weekly);

    /** ---------------- MONTHLY ---------------- */
    let monthly = await manager.findOne(MonthlySummary, {
      where: { account, year, month },
    });
    if (!monthly) {
      monthly = manager.create(MonthlySummary, {
        account,
        year,
        month,
        totalIncome: '0',
        totalExpense: '0',
      });
    }
    if (type === 'income') {
      monthly.totalIncome = (parseFloat(monthly.totalIncome) + delta).toFixed(
        2,
      );
    } else {
      monthly.totalExpense = (parseFloat(monthly.totalExpense) + delta).toFixed(
        2,
      );
    }
    await manager.save(monthly);

    /** ---------------- YEARLY ---------------- */
    let yearly = await manager.findOne(YearlySummary, {
      where: { account, year },
    });
    if (!yearly) {
      yearly = manager.create(YearlySummary, {
        account,
        year,
        totalIncome: '0',
        totalExpense: '0',
      });
    }
    if (type === 'income') {
      yearly.totalIncome = (parseFloat(yearly.totalIncome) + delta).toFixed(2);
    } else {
      yearly.totalExpense = (parseFloat(yearly.totalExpense) + delta).toFixed(
        2,
      );
    }
    await manager.save(yearly);

    /** ---------------- CATEGORY DAILY/MONTHLY ---------------- */
    if (categoryId) {
      const category = { id: categoryId };

      // Daily Category
      let dailyCat = await manager.findOne(DailyCategorySummary, {
        where: { account, date: day, category, type },
      });
      if (!dailyCat) {
        dailyCat = manager.create(DailyCategorySummary, {
          account,
          date: day,
          category,
          type,
          totalAmount: '0',
        });
      }
      dailyCat.totalAmount = (parseFloat(dailyCat.totalAmount) + delta).toFixed(
        2,
      );
      await manager.save(dailyCat);

      // Monthly Category
      let monthlyCat = await manager.findOne(MonthlyCategorySummary, {
        where: { account, category, type, year, month },
      });
      if (!monthlyCat) {
        monthlyCat = manager.create(MonthlyCategorySummary, {
          account,
          category,
          type,
          year,
          month,
          totalAmount: '0',
        });
      }
      monthlyCat.totalAmount = (
        parseFloat(monthlyCat.totalAmount) + delta
      ).toFixed(2);
      await manager.save(monthlyCat);
    }
  }
}
