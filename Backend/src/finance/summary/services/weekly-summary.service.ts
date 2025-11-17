import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import dayjs from 'dayjs';
import { Repository } from 'typeorm';
import { WeeklySummary } from '../entity/weekly-summary.entity';

@Injectable()
export class WeeklySummaryService {
  constructor(
    @InjectRepository(WeeklySummary) private repo: Repository<WeeklySummary>,
  ) {}

  async getWeeklySummary(accountId: number, weekStart: string) {
    return this.repo.findOne({
      where: { account: { id: accountId }, weekStart },
    });
  }

  async getWeeklyComparison(accountId: number, weekStart: string) {
    const thisWeek = await this.getWeeklySummary(accountId, weekStart);
    const prevWeekStart = dayjs(weekStart)
      .subtract(1, 'week')
      .format('YYYY-MM-DD');
    const lastWeek = await this.getWeeklySummary(accountId, prevWeekStart);
    return { thisWeek, lastWeek };
  }

  async getLastNWeeks(accountId: number, n: number) {
    // Explicit type for results array
    type WeekSummaryResult = {
      weekStart: string;
      summary: WeeklySummary | null;
    };

    const results: WeekSummaryResult[] = [];

    for (let i = n - 1; i >= 0; i--) {
      const weekStart = dayjs()
        .subtract(i, 'week')
        .startOf('week')
        .format('YYYY-MM-DD');
      const summary = await this.getWeeklySummary(accountId, weekStart);
      results.push({ weekStart, summary });
    }

    return results;
  }
}
