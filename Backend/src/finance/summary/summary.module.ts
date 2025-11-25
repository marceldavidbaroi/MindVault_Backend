import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailySummary } from './entity/daily-summary.entity';
import { MonthlySummary } from './entity/monthly-summary.entity';
import { MonthlyCategorySummary } from './entity/monthly-category-summary.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { SummaryWorkerService } from './services/summary-worker.service';
import { WeeklySummary } from './entity/weekly-summary.entity';
import { CategorySummaryService } from './services/category-summary.service';
import { DailySummaryService } from './services/daily-summary.service';
import { MonthlySummaryService } from './services/monthly-summary.service';
import { TrendInsightService } from './services/trend-insight.service';
import { YearlySummaryService } from './services/yearly-summary.service';
import { YearlySummary } from './entity/yearly-summary.entity';
import { DailyCategorySummary } from './entity/daily-category-summary.entity';
import { WeeklySummaryService } from './services/weekly-summary.service';
import { SummariesController } from './controller/summary.controller';
import { MasterComparisonSummaryService } from './services/master-comparison-summary.service';
import { CategorySummaryController } from './controller/category-summary.controller';
import { DailySummaryController } from './controller/daily-summary.controller';
import { MonthlySummaryController } from './controller/monthly-summary.controller';
import { WeeklySummaryController } from './controller/weekly-summary.controller';
import { YearlySummaryController } from './controller/yearly-summary.controller';
import { TrendInsightController } from './controller/trend-insight.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DailySummary,
      MonthlySummary,
      MonthlyCategorySummary,
      DailyCategorySummary,
      WeeklySummary,
      YearlySummary,
      Transaction,
    ]),
  ],
  providers: [
    SummaryWorkerService,
    CategorySummaryService,
    DailySummaryService,
    MonthlySummaryService,
    TrendInsightService,
    YearlySummaryService,
    WeeklySummaryService,
    MasterComparisonSummaryService,
  ],
  controllers: [
    SummariesController,
    CategorySummaryController,
    DailySummaryController,
    MonthlySummaryController,
    WeeklySummaryController,
    YearlySummaryController,
    TrendInsightController,
  ],
  exports: [SummaryWorkerService], // so other modules can use it
})
export class SummaryModule {}
