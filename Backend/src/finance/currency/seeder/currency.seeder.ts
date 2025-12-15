// src/finance/currency/seeder/currency.seeder.ts
import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { CurrencyRepository } from '../repository/currency.repository';
import { defaultCurrencies } from '../data/currency.data';

@Injectable()
export class CurrencySeeder {
  constructor(private readonly currencyRepo: CurrencyRepository) {}

  @Command({
    command: 'currency:seed',
    describe: 'Seed default currencies',
  })
  async seed() {
    console.log('🧹 Truncating currencies table...');
    await this.currencyRepo.truncate();

    console.log('📥 Seeding default currencies...');
    await this.currencyRepo.saveMany(defaultCurrencies);

    console.log('✅ Default currencies seeded successfully!');
  }
}
