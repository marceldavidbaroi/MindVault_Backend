import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavingsGoalsController } from './controller/savings-goals.controller';
import { SavingsGoalsService } from './service/savings-goals.service';
import { AccountsModule } from 'src/finance/accounts/accounts.module'; // Assuming path to AccountsModule
import { SavingsGoal } from './entity/savings-goals.entity';

@Module({
  imports: [
    // 1. Register the SavingsGoal entity with TypeORM in this module
    TypeOrmModule.forFeature([SavingsGoal]),

    // 2. Import the AccountsModule to resolve the AccountsService dependency
    forwardRef(() => AccountsModule),
  ],
  controllers: [SavingsGoalsController],
  providers: [SavingsGoalsService],
  // 3. Export the service so other modules (like AccountsModule) can use it if needed
  exports: [SavingsGoalsService],
})
export class SavingsGoalsModule {}
