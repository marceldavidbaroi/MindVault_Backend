import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { YearlySummary } from '../entity/yearly-summary.entity';

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
}
