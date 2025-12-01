import { Injectable } from '@nestjs/common';
import { CategorySummaryService } from './category-summary.service';
import { DailySummaryService } from './daily-summary.service';
import { MonthlySummaryService } from './monthly-summary.service';
import { WeeklySummaryService } from './weekly-summary.service';
import { YearlySummaryService } from './yearly-summary.service';

@Injectable()
export class TrendInsightService {
  constructor(
    private dailyService: DailySummaryService,
    private weeklyService: WeeklySummaryService,
    private monthlyService: MonthlySummaryService,
    private yearlyService: YearlySummaryService,
    private categoryService: CategorySummaryService,
  ) {}

  async getIncomeExpenseTrend(
    accountId: number,
    period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    n: number,
  ) {
    switch (period) {
      case 'daily':
        return this.dailyService.getLastNDays(accountId, n);
      case 'weekly':
        return this.weeklyService.getLastNWeeks(accountId, n);
      case 'monthly':
        return this.monthlyService.getLastNMonths(accountId, n);
      case 'yearly':
        return this.yearlyService.getLastNYears(accountId, n);
    }
  }

  async getTopCategories(
    accountId: number,
    period: 'daily' | 'monthly',
    dateOrMonth: string | number,
    year?: number,
  ) {
    if (period === 'daily') {
      return this.categoryService.getDailyCategorySummary(
        accountId,
        dateOrMonth as string,
      );
    } else {
      const yearValue = year ?? new Date().getFullYear(); // fallback to current year
      return this.categoryService.getMonthlyCategorySummary(
        accountId,
        dateOrMonth as number,
        yearValue,
      );
    }
  }
}
