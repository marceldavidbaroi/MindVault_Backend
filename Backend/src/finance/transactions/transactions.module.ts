import { forwardRef, Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transactions } from './transactions.entity';
import { BudgetsModule } from 'src/finance/budgets/budgets.module';
import { SummaryModule } from '../summary/summary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transactions]),
    forwardRef(() => BudgetsModule),
    forwardRef(() => SummaryModule),
  ],
  providers: [TransactionsService],
  controllers: [TransactionsController],
  exports: [TransactionsService],
})
export class TransactionsModule {}
