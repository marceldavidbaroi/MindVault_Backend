import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { CurrencyModule } from './currency/currency.module';
import { AccountsModule } from './accounts/accounts.module';

@Module({
  imports: [CategoriesModule, CurrencyModule, AccountsModule],
})
export class FinanceModule {}
