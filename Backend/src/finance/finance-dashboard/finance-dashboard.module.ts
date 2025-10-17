import { Module } from '@nestjs/common';
import { FinanceDashboardController } from './finance-dashboard.controller';
import { FinanceDashboardService } from './finance-dashboard.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transactions } from '../transactions/transactions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transactions])],
  controllers: [FinanceDashboardController],
  providers: [FinanceDashboardService],
})
export class FinanceDashboardModule {}
