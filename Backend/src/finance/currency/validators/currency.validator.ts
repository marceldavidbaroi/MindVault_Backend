import { BadRequestException, Injectable } from '@nestjs/common';
import { CurrencyRepository } from '../repository/currency.repository';
import { Currency } from '../entity/currency.entity';

@Injectable()
export class CurrencyValidator {
  constructor(private readonly currencyRepo: CurrencyRepository) {}

  async ensureCurrencyExists(code: string): Promise<Currency> {
    const currency = await this.currencyRepo.findByCode(code);

    if (!currency) {
      throw new BadRequestException('Invalid currency code');
    }

    if (!currency.isActive) {
      throw new BadRequestException('Currency is not active');
    }

    return currency;
  }
}
