import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Command } from 'nestjs-command';
import { AccountTypeRepository } from '../repository/account-type.repository';
import { defaultAccountTypes } from '../data/account-type.data';

@Injectable()
export class AccountTypeSeeder {
  constructor(
    private readonly dataSource: DataSource,
    private readonly accountTypeRepo: AccountTypeRepository,
  ) {}

  @Command({
    command: 'account-type:seed',
    describe: 'Seed default account types',
  })
  async seed() {
    console.log('🧹 Clearing account_types table...');

    // Full reset: data + dependent FKs
    await this.dataSource.query(
      `TRUNCATE TABLE account_types RESTART IDENTITY CASCADE;`,
    );

    console.log('📥 Seeding default account types...');

    // Use repository to save all default types
    await this.accountTypeRepo.saveMany(defaultAccountTypes);

    console.log('✅ Default account types seeded!');
  }
}
