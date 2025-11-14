import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DailySummary } from '../entity/daily-summary.entity';
import { MonthlySummary } from '../entity/monthly-summary.entity';
import {
  MonthlyCategorySummary,
  TransactionType,
} from '../entity/monthly-category-summary.entity';

import dayjs from 'dayjs';
import { Transaction } from 'src/finance/transactions/entities/transaction.entity';

@Injectable()
export class SummaryWorkerService {
  private readonly logger = new Logger(SummaryWorkerService.name);

  constructor(
    @InjectRepository(DailySummary)
    private readonly dailySummaryRepo: Repository<DailySummary>,
    @InjectRepository(MonthlySummary)
    private readonly monthlySummaryRepo: Repository<MonthlySummary>,
    @InjectRepository(MonthlyCategorySummary)
    private readonly monthlyCategorySummaryRepo: Repository<MonthlyCategorySummary>,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Update all summaries for a new transaction
   */
  async handleTransaction(transaction: Transaction) {
    const { account, amount, transactionDate, type, category } = transaction;

    // Ensure the amount is a valid number
    const decimalAmount = parseFloat(amount);
    if (isNaN(decimalAmount)) {
      this.logger.error(
        `Invalid transaction amount: ${amount} for transaction ${transaction.id}`,
      );
      return;
    }

    const date = dayjs(transactionDate);
    const year = date.year();
    const month = date.month() + 1; // 0-indexed
    const day = date.format('YYYY-MM-DD');

    await this.dataSource.transaction(async (manager) => {
      // --- Daily Summary ---
      let daily = await manager.findOne(DailySummary, {
        where: { date: day, account: { id: account.id } },
        relations: ['account'],
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
        daily.totalIncome = (
          parseFloat(daily.totalIncome) + decimalAmount
        ).toFixed(2);
      } else {
        daily.totalExpense = (
          parseFloat(daily.totalExpense) + decimalAmount
        ).toFixed(2);
      }

      await manager.save(daily);

      // --- Monthly Summary ---
      let monthly = await manager.findOne(MonthlySummary, {
        where: { account: { id: account.id }, year, month },
        relations: ['account'],
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
        monthly.totalIncome = (
          parseFloat(monthly.totalIncome) + decimalAmount
        ).toFixed(2);
      } else {
        monthly.totalExpense = (
          parseFloat(monthly.totalExpense) + decimalAmount
        ).toFixed(2);
      }

      await manager.save(monthly);

      // --- Monthly Category Summary ---
      if (category) {
        let categorySummary = await manager.findOne(MonthlyCategorySummary, {
          where: {
            account: { id: account.id },
            category: { id: category.id },
            type,
            year,
            month,
          },
          relations: ['account', 'category'],
        });

        if (!categorySummary) {
          categorySummary = manager.create(MonthlyCategorySummary, {
            account,
            category,
            type,
            year,
            month,
            totalAmount: '0',
          });
        }

        categorySummary.totalAmount = (
          parseFloat(categorySummary.totalAmount) + decimalAmount
        ).toFixed(2);

        await manager.save(categorySummary);
      }
    });

    this.logger.log(`Updated summaries for transaction ${transaction.id}`);
  }

  async handleTransactionUpdate(
    oldTransaction: Transaction,
    newTransaction: Transaction,
  ) {
    const {
      account: oldAccount,
      amount: oldAmount,
      transactionDate: oldDate,
      type: oldType,
      category: oldCategory,
    } = oldTransaction;
    const {
      account: newAccount,
      amount: newAmount,
      transactionDate: newDate,
      type: newType,
      category: newCategory,
    } = newTransaction;

    const oldDecimal = parseFloat(oldAmount);
    const newDecimal = parseFloat(newAmount);

    if (isNaN(oldDecimal) || isNaN(newDecimal)) {
      this.logger.error(
        `Invalid transaction amount. Old: ${oldAmount}, New: ${newAmount}`,
      );
      return;
    }

    const oldDay = dayjs(oldDate).format('YYYY-MM-DD');
    const oldYear = dayjs(oldDate).year();
    const oldMonth = dayjs(oldDate).month() + 1;

    const newDay = dayjs(newDate).format('YYYY-MM-DD');
    const newYear = dayjs(newDate).year();
    const newMonth = dayjs(newDate).month() + 1;

    await this.dataSource.transaction(async (manager) => {
      // --- Daily Summary ---
      if (oldDay !== newDay || oldAccount.id !== newAccount.id) {
        // Remove old amount from old daily summary
        let oldDaily = await manager.findOne(DailySummary, {
          where: { date: oldDay, account: { id: oldAccount.id } },
          relations: ['account'],
        });
        if (oldDaily) {
          if (oldType === 'income')
            oldDaily.totalIncome = (
              parseFloat(oldDaily.totalIncome) - oldDecimal
            ).toFixed(2);
          else
            oldDaily.totalExpense = (
              parseFloat(oldDaily.totalExpense) - oldDecimal
            ).toFixed(2);
          await manager.save(oldDaily);
        }
      }

      // Add new amount to new daily summary
      let newDaily = await manager.findOne(DailySummary, {
        where: { date: newDay, account: { id: newAccount.id } },
        relations: ['account'],
      });
      if (!newDaily) {
        newDaily = manager.create(DailySummary, {
          account: newAccount,
          date: newDay,
          totalIncome: '0',
          totalExpense: '0',
        });
      }
      if (newType === 'income')
        newDaily.totalIncome = (
          parseFloat(newDaily.totalIncome) + newDecimal
        ).toFixed(2);
      else
        newDaily.totalExpense = (
          parseFloat(newDaily.totalExpense) + newDecimal
        ).toFixed(2);
      await manager.save(newDaily);

      // --- Monthly Summary ---
      if (
        oldMonth !== newMonth ||
        oldYear !== newYear ||
        oldAccount.id !== newAccount.id
      ) {
        // Remove old amount
        let oldMonthly = await manager.findOne(MonthlySummary, {
          where: {
            account: { id: oldAccount.id },
            year: oldYear,
            month: oldMonth,
          },
        });
        if (oldMonthly) {
          if (oldType === 'income')
            oldMonthly.totalIncome = (
              parseFloat(oldMonthly.totalIncome) - oldDecimal
            ).toFixed(2);
          else
            oldMonthly.totalExpense = (
              parseFloat(oldMonthly.totalExpense) - oldDecimal
            ).toFixed(2);
          await manager.save(oldMonthly);
        }
      }

      // Add new amount
      let newMonthly = await manager.findOne(MonthlySummary, {
        where: {
          account: { id: newAccount.id },
          year: newYear,
          month: newMonth,
        },
      });
      if (!newMonthly) {
        newMonthly = manager.create(MonthlySummary, {
          account: newAccount,
          year: newYear,
          month: newMonth,
          totalIncome: '0',
          totalExpense: '0',
        });
      }
      if (newType === 'income')
        newMonthly.totalIncome = (
          parseFloat(newMonthly.totalIncome) + newDecimal
        ).toFixed(2);
      else
        newMonthly.totalExpense = (
          parseFloat(newMonthly.totalExpense) + newDecimal
        ).toFixed(2);
      await manager.save(newMonthly);

      // --- Monthly Category Summary ---
      // Remove old category amount
      if (oldCategory) {
        let oldCatSummary = await manager.findOne(MonthlyCategorySummary, {
          where: {
            account: { id: oldAccount.id },
            category: { id: oldCategory.id },
            type: oldType,
            year: oldYear,
            month: oldMonth,
          },
        });
        if (oldCatSummary) {
          oldCatSummary.totalAmount = (
            parseFloat(oldCatSummary.totalAmount) - oldDecimal
          ).toFixed(2);
          await manager.save(oldCatSummary);
        }
      }

      // Add new category amount
      if (newCategory) {
        let newCatSummary = await manager.findOne(MonthlyCategorySummary, {
          where: {
            account: { id: newAccount.id },
            category: { id: newCategory.id },
            type: newType,
            year: newYear,
            month: newMonth,
          },
        });
        if (!newCatSummary) {
          newCatSummary = manager.create(MonthlyCategorySummary, {
            account: newAccount,
            category: newCategory,
            type: newType,
            year: newYear,
            month: newMonth,
            totalAmount: '0',
          });
        }
        newCatSummary.totalAmount = (
          parseFloat(newCatSummary.totalAmount) + newDecimal
        ).toFixed(2);
        await manager.save(newCatSummary);
      }
    });

    this.logger.log(
      `Updated summaries for transaction update ${newTransaction.id}`,
    );
  }

  async handleTransactionDelete(transaction: Transaction) {
    const { account, amount, transactionDate, type, category } = transaction;

    const decimalAmount = parseFloat(amount);
    if (isNaN(decimalAmount)) {
      this.logger.error(
        `Invalid transaction amount on delete: ${amount} for transaction ${transaction.id}`,
      );
      return;
    }

    const day = dayjs(transactionDate).format('YYYY-MM-DD');
    const year = dayjs(transactionDate).year();
    const month = dayjs(transactionDate).month() + 1;

    await this.dataSource.transaction(async (manager) => {
      // -------------------------------------------------------------
      // DAILY SUMMARY — subtract the amount
      // -------------------------------------------------------------
      let daily = await manager.findOne(DailySummary, {
        where: { date: day, account: { id: account.id } },
        relations: ['account'],
      });

      if (daily) {
        if (type === 'income') {
          daily.totalIncome = (
            parseFloat(daily.totalIncome) - decimalAmount
          ).toFixed(2);
        } else {
          daily.totalExpense = (
            parseFloat(daily.totalExpense) - decimalAmount
          ).toFixed(2);
        }

        await manager.save(daily);
      }

      // -------------------------------------------------------------
      // MONTHLY SUMMARY — subtract the amount
      // -------------------------------------------------------------
      let monthly = await manager.findOne(MonthlySummary, {
        where: { account: { id: account.id }, year, month },
        relations: ['account'],
      });

      if (monthly) {
        if (type === 'income') {
          monthly.totalIncome = (
            parseFloat(monthly.totalIncome) - decimalAmount
          ).toFixed(2);
        } else {
          monthly.totalExpense = (
            parseFloat(monthly.totalExpense) - decimalAmount
          ).toFixed(2);
        }

        await manager.save(monthly);
      }

      // -------------------------------------------------------------
      // MONTHLY CATEGORY SUMMARY — subtract category amount
      // -------------------------------------------------------------
      if (category) {
        let catSummary = await manager.findOne(MonthlyCategorySummary, {
          where: {
            account: { id: account.id },
            category: { id: category.id },
            type,
            year,
            month,
          },
          relations: ['account', 'category'],
        });

        if (catSummary) {
          catSummary.totalAmount = (
            parseFloat(catSummary.totalAmount) - decimalAmount
          ).toFixed(2);

          await manager.save(catSummary);
        }
      }
    });

    this.logger.log(
      `Updated summaries for deleted transaction ${transaction.id}`,
    );
  }
}
