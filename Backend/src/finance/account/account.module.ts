import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { Account } from './account.entity';
import { AccountType } from '../account_types/account_types.entity';
import { User } from 'src/auth/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, AccountType, User]), // <-- make sure Account is here
  ],
  providers: [AccountService],
  controllers: [AccountController],
  exports: [AccountService], // export if used outside
})
export class AccountModule {}
