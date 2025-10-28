import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountType } from './account_types.entity';
import { AccountTypesService } from './account_types.service';
import { AccountTypesController } from './account_types.controller';
import { AccountTypeSeeder } from './account-types.seeder';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountType]), // ✅ Register the repository
  ],
  providers: [AccountTypeSeeder, AccountTypesService],
  controllers: [AccountTypesController],
  exports: [AccountTypesService], // optional if used in other modules
})
export class AccountTypesModule {}
