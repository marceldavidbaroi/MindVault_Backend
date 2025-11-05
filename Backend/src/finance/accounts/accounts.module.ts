import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsService } from './services/accounts.service';
import { AccountTypesService } from './services/account-types.service';
import { AccountUserRolesService } from './services/account-user-roles.service.service';
import { AccountsController } from './accounts.controller';
import { Account } from './entity/account.entity';
import { AccountType } from './entity/account-type.entity';
import { AccountUserRole } from './entity/account-user-role.entity';
import { AccountTypeSeeder } from './account-type.seeder';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, AccountType, AccountUserRole]),
    RolesModule,
  ],
  controllers: [AccountsController],
  providers: [
    AccountTypeSeeder,
    AccountsService,
    AccountTypesService,
    AccountUserRolesService,
  ],
  exports: [AccountsService, AccountTypesService, AccountUserRolesService],
})
export class AccountsModule {}
