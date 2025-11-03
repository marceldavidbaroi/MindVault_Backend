// src/finance/currency/currency.seeder.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Command } from 'nestjs-command';
import { Currency } from './entity/currency.entity';
import { defaultCurrencies } from './currency.data';

@Injectable()
export class CurrencySeeder {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Currency)
    private readonly currencyRepo: Repository<Currency>,
  ) {}

  @Command({
    command: 'currency:seed',
    describe: 'Seed default currencies',
  })
  async seed() {
    // Clear table and dependent tables
    await this.dataSource.query(`TRUNCATE TABLE currencies CASCADE;`);

    // Save default currencies
    await this.currencyRepo.save(defaultCurrencies);

    console.log('✅ Default currencies seeded!');
  }
}
