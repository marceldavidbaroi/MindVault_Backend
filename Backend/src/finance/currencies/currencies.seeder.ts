import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from './currencies.entity';

@Injectable()
export class CurrenciesSeeder implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepo: Repository<Currency>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.currencyRepo.count();
    if (count === 0) {
      const currencies = [
        { code: 'USD', name: 'US Dollar', symbol: '$', decimal: 2 },
        { code: 'EUR', name: 'Euro', symbol: '€', decimal: 2 },
        { code: 'GBP', name: 'British Pound', symbol: '£', decimal: 2 },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimal: 0 },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimal: 2 },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimal: 2 },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimal: 2 },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimal: 2 },
        { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimal: 2 },
        { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimal: 2 },
        { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', decimal: 2 },
        { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimal: 2 },
        { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', decimal: 2 },
        { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimal: 2 },
        { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', decimal: 2 },
        { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', decimal: 2 },
        { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', decimal: 2 },
        { code: 'ZAR', name: 'South African Rand', symbol: 'R', decimal: 2 },
      ];
      await this.currencyRepo.save(currencies);
      console.log('Currencies table seeded successfully.');
    }
  }
}
