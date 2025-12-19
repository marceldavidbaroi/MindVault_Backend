import { Module } from '@nestjs/common';
import { CurrencyModule } from './currency/currency.module';
import { CategoriesModule } from './category/categories.module';
import { AccountsModule } from './accounts/accounts.module';

@Module({
  imports: [CurrencyModule, CategoriesModule, AccountsModule],
})
export class FinanceModule {}
