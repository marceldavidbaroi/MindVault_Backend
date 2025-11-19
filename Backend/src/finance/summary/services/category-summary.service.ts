import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyCategorySummary } from '../entity/daily-category-summary.entity';
import { MonthlyCategorySummary } from '../entity/monthly-category-summary.entity';

@Injectable()
export class CategorySummaryService {
  constructor(
    @InjectRepository(DailyCategorySummary)
    private dailyRepo: Repository<DailyCategorySummary>,
    @InjectRepository(MonthlyCategorySummary)
    private monthlyRepo: Repository<MonthlyCategorySummary>,
  ) {}

  /** Get daily category summary, grouped by category and type */
  async getDailyCategorySummary(accountId: number, date: string) {
    return this.dailyRepo
      .createQueryBuilder('d')
      .leftJoin('d.category', 'c')
      .select('c.id', 'categoryId')
      .addSelect('c.displayName', 'displayName')
      .addSelect('d.type', 'type')
      .addSelect('SUM(d.total_amount)', 'totalAmount')
      .where('d.account_id = :accountId', { accountId })
      .andWhere('d.date = :date', { date })
      .groupBy('c.id')
      .addGroupBy('c.name')
      .addGroupBy('d.type')
      .getRawMany();
  }

  /** Get monthly category summary, grouped by category and type */
  async getMonthlyCategorySummary(
    accountId: number,
    month: number,
    year: number,
  ) {
    return this.monthlyRepo
      .createQueryBuilder('m')
      .leftJoin('m.category', 'c')
      .select('c.id', 'categoryId')
      .addSelect('c.displayName', 'displayName')
      .addSelect('m.type', 'type')
      .addSelect('SUM(m.total_amount)', 'totalAmount')
      .where('m.account_id = :accountId', { accountId })
      .andWhere('m.month = :month', { month })
      .andWhere('m.year = :year', { year })
      .groupBy('c.id')
      .addGroupBy('c.name')
      .addGroupBy('m.type')
      .getRawMany();
  }
}
