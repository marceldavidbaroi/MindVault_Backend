import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { CurrencyModule } from './currency/currency.module';
import { AccountsModule } from './accounts/accounts.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    CategoriesModule,
    CurrencyModule,
    AccountsModule,
    TransactionsModule,
  ],
})
export class FinanceModule {}
