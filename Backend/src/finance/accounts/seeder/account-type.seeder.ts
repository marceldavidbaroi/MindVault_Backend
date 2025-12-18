// src/finance/account-type/seeder/account-type.seeder.ts
import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { AccountTypeRepository } from '../repository/account-type.repository';
import { defaultAccountTypes } from '../data/account-type.data';

@Injectable()
export class AccountTypeSeeder {
  constructor(private readonly accountTypeRepo: AccountTypeRepository) {}

  @Command({
    command: 'account-type:seed',
    describe: 'Seed default account types',
  })
  async seed() {
    console.log('🧹 Truncating account_types table...');
    await this.accountTypeRepo.truncate();

    console.log('📥 Seeding default account types...');
    await this.accountTypeRepo.saveMany(defaultAccountTypes);

    console.log('✅ Default account types seeded successfully!');
  }
}
