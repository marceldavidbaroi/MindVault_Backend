import { Injectable } from '@nestjs/common';
import { CurrencyRepository } from '../repository/currency.repository';
import { CurrencyTransformer } from '../transformers/currency.transformer';

@Injectable()
export class CurrencyService {
  constructor(
    private readonly currencyRepo: CurrencyRepository,
    private readonly transformer: CurrencyTransformer,
  ) {}

  async listCurrencies() {
    const currencies = await this.currencyRepo.findAllPublic();
    return this.transformer.formatMany(currencies);
  }
}
