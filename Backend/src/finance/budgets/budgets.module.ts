import { forwardRef, Module } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { BudgetsController } from './budgets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budgets } from './budgets.entity';
import { TransactionsModule } from 'src/finance/transactions/transactions.module';
import { Transactions } from 'src/finance/transactions/transactions.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Budgets, Transactions]),
    forwardRef(() => TransactionsModule),
  ],
  providers: [BudgetsService],
  controllers: [BudgetsController],
  exports: [BudgetsService],
})
export class BudgetsModule {}
