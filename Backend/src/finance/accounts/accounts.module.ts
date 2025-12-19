import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountsService } from './services/accounts.service';
import { AccountTypesService } from './services/account-types.service';
import { AccountUserRolesService } from './services/account-user-roles.service';
import { AccountLogService } from './services/account-log.service';

import { AccountsController } from './controller/accounts.controller';
import { AccountTypesController } from './controller/account-types.controller';
import { AccountUserRolesController } from './controller/account-user-roles.controller';
import { AccountLogController } from './controller/account-log.controller';

import { Account } from './entity/account.entity';
import { AccountType } from './entity/account-type.entity';
import { AccountUserRole } from './entity/account-user-role.entity';
import { AccountLog } from './entity/account-log.entity';

import { AccountTypeSeeder } from './seeder/account-type.seeder';

// ✅ repositories
import { AccountRepository } from './repository/account.repository';
import { AccountTypeRepository } from './repository/account-type.repository';
import { AccountUserRoleRepository } from './repository/account-user-role.repository';
import { AccountLogRepository } from './repository/account-log.repository';

import { RolesModule } from 'src/roles/roles.module';
import { AuthModule } from 'src/auth/auth.module';
import { CurrencyModule } from '../currency/currency.module';

import { AccountValidator } from './validators/account.validator';
import { AccountTypeValidator } from './validators/account-type.validator';
import { AccountUserRoleValidator } from './validators/account-user-role.validator';
import { AccountLogValidator } from './validators/account-log.validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account,
      AccountType,
      AccountUserRole,
      AccountLog,
    ]),
    RolesModule,
    AuthModule,
    CurrencyModule,
  ],
  controllers: [
    AccountsController,
    AccountTypesController,
    AccountUserRolesController,
    AccountLogController,
  ],
  providers: [
    // ✅ repositories (THIS WAS MISSING)
    AccountRepository,
    AccountTypeRepository,
    AccountUserRoleRepository,
    AccountLogRepository,

    // seeders
    AccountTypeSeeder,

    // services
    AccountsService,
    AccountTypesService,
    AccountUserRolesService,
    AccountLogService,

    // validators
    AccountValidator,
    AccountTypeValidator,
    AccountUserRoleValidator,
    AccountLogValidator,
  ],
  exports: [
    // services
    AccountsService,
    AccountTypesService,
    AccountUserRolesService,
    AccountLogService,

    // repositories (export if used elsewhere)
    AccountRepository,
    AccountTypeRepository,
    AccountUserRoleRepository,
    AccountLogRepository,

    // validators
    AccountValidator,
    AccountTypeValidator,
    AccountUserRoleValidator,
    AccountLogValidator,
  ],
})
export class AccountsModule {}
