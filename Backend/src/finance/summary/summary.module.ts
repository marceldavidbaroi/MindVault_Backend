import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailySummary } from './entity/daily-summary.entity';
import { MonthlySummary } from './entity/monthly-summary.entity';
import { MonthlyCategorySummary } from './entity/monthly-category-summary.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { SummaryWorkerService } from './services/summary-worker.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DailySummary,
      MonthlySummary,
      MonthlyCategorySummary,
      Transaction,
    ]),
  ],
  providers: [SummaryWorkerService],
  exports: [SummaryWorkerService], // so other modules can use it
})
export class SummaryModule {}
