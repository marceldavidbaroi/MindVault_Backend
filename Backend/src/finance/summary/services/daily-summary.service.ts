import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { DailySummary } from '../entity/daily-summary.entity';
import dayjs from 'dayjs';

@Injectable()
export class DailySummaryService {
  constructor(
    @InjectRepository(DailySummary) private repo: Repository<DailySummary>,
  ) {}

  async getDailySummary(accountId: number, date: string) {
    return this.repo.findOne({ where: { account: { id: accountId }, date } });
  }

  async getDailyComparison(accountId: number, date: string) {
    const today = await this.getDailySummary(accountId, date);
    const prevDate = dayjs(date).subtract(1, 'day').format('YYYY-MM-DD');
    const yesterday = await this.getDailySummary(accountId, prevDate);
    return { today, yesterday };
  }

  async getLastNDays(accountId: number, n: number) {
    const startDate = dayjs()
      .subtract(n - 1, 'day')
      .format('YYYY-MM-DD');
    return this.repo.find({
      where: {
        account: { id: accountId },
        date: Between(startDate, dayjs().format('YYYY-MM-DD')),
      },
      order: { date: 'ASC' },
    });
  }
}
