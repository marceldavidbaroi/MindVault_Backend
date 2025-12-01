import { Injectable } from '@nestjs/common';
import { DailySummaryService } from './daily-summary.service';
import { WeeklySummaryService } from './weekly-summary.service';
import { MonthlySummaryService } from './monthly-summary.service';
import { YearlySummaryService } from './yearly-summary.service';
import dayjs from 'dayjs';

@Injectable()
export class MasterComparisonSummaryService {
  constructor(
    private dailyService: DailySummaryService,
    private weeklyService: WeeklySummaryService,
    private monthlyService: MonthlySummaryService,
    private yearlyService: YearlySummaryService,
  ) {}

  private cleanSummary(
    summary: any,
    type: 'daily' | 'weekly' | 'monthly' | 'yearly',
  ) {
    if (!summary) {
      // return empty structure depending on type
      switch (type) {
        case 'daily':
          return {
            id: null,
            date: null,
            totalIncome: '0.00',
            totalExpense: '0.00',
          };
        case 'weekly':
          return {
            id: null,
            weekStart: null,
            totalIncome: '0.00',
            totalExpense: '0.00',
          };
        case 'monthly':
          return {
            id: null,
            year: null,
            month: null,
            totalIncome: '0.00',
            totalExpense: '0.00',
          };
        case 'yearly':
          return {
            id: null,
            year: null,
            totalIncome: '0.00',
            totalExpense: '0.00',
          };
      }
    }
    const { createdAt, updatedAt, ...rest } = summary;
    return rest;
  }

  async getAllComparisons(accountId: number, date: string) {
    // DAILY
    const daily = await this.dailyService.getDailyComparison(accountId, date);
    const dailyResult = {
      today: this.cleanSummary(daily?.today, 'daily'),
      yesterday: this.cleanSummary(daily?.yesterday, 'daily'),
    };

    // WEEKLY
    const weekStart = dayjs(date).startOf('week').format('YYYY-MM-DD');
    const weekly = await this.weeklyService.getWeeklyComparison(
      accountId,
      weekStart,
    );
    const weeklyResult = {
      thisWeek: this.cleanSummary(weekly?.thisWeek, 'weekly'),
      lastWeek: this.cleanSummary(weekly?.lastWeek, 'weekly'),
    };

    // MONTHLY
    const month = dayjs(date).month() + 1;
    const year = dayjs(date).year();
    const monthly = await this.monthlyService.getMonthlyComparison(
      accountId,
      month,
      year,
    );
    const monthlyResult = {
      thisMonth: this.cleanSummary(monthly?.thisMonth, 'monthly'),
      lastMonth: this.cleanSummary(monthly?.lastMonth, 'monthly'),
    };

    // YEARLY
    const yearly = await this.yearlyService.getYearlyComparison(
      accountId,
      year,
    );
    const yearlyResult = {
      thisYear: this.cleanSummary(yearly?.thisYear, 'yearly'),
      lastYear: this.cleanSummary(yearly?.lastYear, 'yearly'),
    };

    return {
      daily: dailyResult,
      weekly: weeklyResult,
      monthly: monthlyResult,
      yearly: yearlyResult,
    };
  }
}
