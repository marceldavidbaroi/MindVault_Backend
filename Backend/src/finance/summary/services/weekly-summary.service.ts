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
}
