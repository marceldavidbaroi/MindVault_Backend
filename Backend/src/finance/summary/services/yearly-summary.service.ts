import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { YearlySummary } from '../entity/yearly-summary.entity';
import dayjs from 'dayjs';

@Injectable()
export class YearlySummaryService {
  constructor(
    @InjectRepository(YearlySummary) private repo: Repository<YearlySummary>,
  ) {}

  async getYearlySummary(accountId: number, year: number) {
    return this.repo.findOne({ where: { account: { id: accountId }, year } });
  }

  async getYearlyComparison(accountId: number, year: number) {
    const thisYear = await this.getYearlySummary(accountId, year);
    const lastYear = await this.getYearlySummary(accountId, year - 1);
    return { thisYear, lastYear };
  }

  async getLastNYears(accountId: number, n: number) {
    // Explicit type for results array
    type YearSummaryResult = {
      year: number;
      summary: YearlySummary | null;
    };

    const results: YearSummaryResult[] = [];
    const currentYear = dayjs().year();

    for (let i = n - 1; i >= 0; i--) {
      const year = currentYear - i;
      const summary = await this.getYearlySummary(accountId, year);
      results.push({ year, summary });
    }

    return results;
  }
}
