// finance.module.ts
import { Module } from '@nestjs/common';
import { TransactionsModule } from './transactions/transactions.module';
import { BudgetsModule } from './budgets/budgets.module';
import { FinanceDashboardModule } from './finance-dashboard/finance-dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { SavingsGoalsModule } from './savings-goals/savings-goals.module';
import { CategoriesModule } from './categories/categories.module';
import { SummaryModule } from './summary/summary.module';

@Module({
  imports: [
    TransactionsModule,
    BudgetsModule,
    FinanceDashboardModule,
    ReportsModule,
    SavingsGoalsModule,
    CategoriesModule,
    SummaryModule,
  ],
  exports: [
    TransactionsModule,
    BudgetsModule,
    FinanceDashboardModule,
    ReportsModule,
    SavingsGoalsModule,
  ],
})
export class FinanceModule {}
