// src/finance/accounts/seeder/account-type.seeder.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Command } from 'nestjs-command';
import { AccountType } from './entity/account-type.entity';
import { defaultAccountTypes } from './data/account-type.data';

@Injectable()
export class AccountTypeSeeder {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(AccountType)
    private readonly accountTypeRepo: Repository<AccountType>,
  ) {}

  @Command({
    command: 'account-type:seed',
    describe: 'Seed default account types',
  })
  async seed() {
    // Clear table and dependent tables
    await this.dataSource.query(`TRUNCATE TABLE account_types CASCADE;`);

    // Save default account types
    await this.accountTypeRepo.save(defaultAccountTypes);

    console.log('✅ Default account types seeded!');
  }
}
