import { Module } from '@nestjs/common';
import { SavingsGoalsController } from './savings-goals.controller';
import { SavingsGoalsService } from './savings-goals.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsModule } from 'src/finance/transactions/transactions.module';
import { SavingsGoals } from './savings-goals.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SavingsGoals]), TransactionsModule],
  controllers: [SavingsGoalsController],
  providers: [SavingsGoalsService],
  exports: [SavingsGoalsService],
})
export class SavingsGoalsModule {}
