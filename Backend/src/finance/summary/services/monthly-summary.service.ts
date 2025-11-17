import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MonthlySummary } from '../entity/monthly-summary.entity';
import { Repository } from 'typeorm';
import dayjs from 'dayjs';

@Injectable()
export class MonthlySummaryService {
  constructor(
    @InjectRepository(MonthlySummary) private repo: Repository<MonthlySummary>,
  ) {}

  async getMonthlySummary(accountId: number, month: number, year: number) {
    return this.repo.findOne({
      where: { account: { id: accountId }, month, year },
    });
  }

  async getMonthlyComparison(accountId: number, month: number, year: number) {
    const thisMonth = await this.getMonthlySummary(accountId, month, year);
    const prevMonthDate = dayjs(`${year}-${month}-01`).subtract(1, 'month');
    const lastMonth = await this.getMonthlySummary(
      accountId,
      prevMonthDate.month() + 1,
      prevMonthDate.year(),
    );
    return { thisMonth, lastMonth };
  }

  async getLastNMonths(accountId: number, n: number) {
    // Explicitly type the array
    type MonthSummaryResult = {
      month: number;
      year: number;
      summary: MonthlySummary | null;
    };

    const results: MonthSummaryResult[] = [];

    for (let i = n - 1; i >= 0; i--) {
      const date = dayjs().subtract(i, 'month');
      const summary = await this.getMonthlySummary(
        accountId,
        date.month() + 1,
        date.year(),
      );
      results.push({ month: date.month() + 1, year: date.year(), summary });
    }

    return results;
  }
}
