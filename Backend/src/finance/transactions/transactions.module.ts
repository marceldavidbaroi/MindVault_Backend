import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { RecurringTransactionSchedule } from './entities/recurring-transaction-schedule.entity';
import { TransactionService } from './services/transaction.service';
import { RecurringTransactionService } from './services/recurring-transaction.service';
import { TransactionsController } from './controllers/transactions.controller';

// Import other modules (accounts, users, categories, currency) - adjust paths as needed
import { AccountsModule } from 'src/finance/accounts/accounts.module';
import { CurrencyModule } from 'src/finance/currency/currency.module';
import { CategoriesModule } from 'src/finance/categories/categories.module';
import { AuthModule } from 'src/auth/auth.module';
import { SummaryModule } from '../summary/summary.module';
import { AccountLedger } from './entities/ledger.entity';
import { LedgerService } from './services/ledger.service';
import { Account } from '../accounts/entity/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      RecurringTransactionSchedule,
      AccountLedger,
      Account,
    ]),
    // account module is used for accountService
    AccountsModule,
    CurrencyModule,
    CategoriesModule,
    SummaryModule,

    AuthModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionService, RecurringTransactionService, LedgerService],
  exports: [TransactionService, RecurringTransactionService],
})
export class TransactionsModule {}
