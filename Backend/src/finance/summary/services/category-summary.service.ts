import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DailyCategorySummary } from '../entity/daily-category-summary.entity';
import { Repository } from 'typeorm';
import { MonthlyCategorySummary } from '../entity/monthly-category-summary.entity';

@Injectable()
export class CategorySummaryService {
  constructor(
    @InjectRepository(DailyCategorySummary)
    private dailyRepo: Repository<DailyCategorySummary>,
    @InjectRepository(MonthlyCategorySummary)
    private monthlyRepo: Repository<MonthlyCategorySummary>,
  ) {}

  async getDailyCategorySummary(accountId: number, date: string) {
    return this.dailyRepo.find({ where: { account: { id: accountId }, date } });
  }

  async getMonthlyCategorySummary(
    accountId: number,
    month: number,
    year: number,
  ) {
    return this.monthlyRepo.find({
      where: { account: { id: accountId }, month, year },
    });
  }
}
