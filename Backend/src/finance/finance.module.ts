import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { CurrencyModule } from './currency/currency.module';

@Module({
  imports: [CategoriesModule, CurrencyModule]
})
export class FinanceModule {}
