import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { CurrencyModule } from './currency/currency.module';
import { AccountsModule } from './accounts/accounts.module';
import { TransactionsModule } from './transactions/transactions.module';
import { SummaryModule } from './summary/summary.module';
import { SavingsGoalsModule } from './savings-goals/savings-goals.module';

@Module({
  imports: [
    CategoriesModule,
    CurrencyModule,
    AccountsModule,
    TransactionsModule,
    SummaryModule,
    SavingsGoalsModule,
  ],
})
export class FinanceModule {}
