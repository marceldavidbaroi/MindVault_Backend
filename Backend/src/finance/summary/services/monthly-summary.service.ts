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
}
