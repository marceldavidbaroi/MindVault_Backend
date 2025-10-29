// finance.module.ts
import { Module } from '@nestjs/common';
import { TransactionsModule } from './transactions/transactions.module';
import { BudgetsModule } from './budgets/budgets.module';
import { FinanceDashboardModule } from './finance-dashboard/finance-dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { SavingsGoalsModule } from './savings-goals/savings-goals.module';
import { CategoriesModule } from './categories/categories.module';
import { SummaryModule } from './summary/summary.module';
import { AccountModule } from './account/account.module';
import { AccountTypesModule } from './account_types/account_types.module';
import { CurrenciesModule } from './currencies/currencies.module';

@Module({
  imports: [
    TransactionsModule,
    BudgetsModule,
    FinanceDashboardModule,
    ReportsModule,
    SavingsGoalsModule,
    CategoriesModule,
    SummaryModule,
    AccountModule,
    AccountTypesModule,
    CurrenciesModule,
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
