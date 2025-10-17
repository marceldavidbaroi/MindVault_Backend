import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reports } from './reports.entity';
import { TransactionsModule } from 'src/finance/transactions/transactions.module';
import { BudgetsModule } from 'src/finance/budgets/budgets.module';
import { SavingsGoalsModule } from 'src/finance/savings-goals/savings-goals.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reports]),
    TransactionsModule,
    BudgetsModule,
    SavingsGoalsModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
