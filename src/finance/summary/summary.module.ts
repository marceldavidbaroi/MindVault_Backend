import { Module } from '@nestjs/common';
import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transactions } from '../transactions/transactions.entity';
import { DailySummary } from './daily_summary.entity';
import { MonthlySummary } from './monthly_summary.entity';
import { MonthlyCategorySummary } from './category_monthly_summary.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transactions,
      DailySummary,
      MonthlySummary,
      MonthlyCategorySummary,
    ]),
  ],
  controllers: [SummaryController],
  providers: [SummaryService],
  exports: [SummaryService],
})
export class SummaryModule {}
