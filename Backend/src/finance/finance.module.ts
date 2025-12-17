import { Module } from '@nestjs/common';
import { CurrencyModule } from './currency/currency.module';
import { CategoriesModule } from './category/categories.module';

@Module({
  imports: [CurrencyModule, CategoriesModule],
})
export class FinanceModule {}
