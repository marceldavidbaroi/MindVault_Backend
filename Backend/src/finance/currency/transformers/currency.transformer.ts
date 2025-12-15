import { Injectable } from '@nestjs/common';
import { Currency } from '../entity/currency.entity';

@Injectable()
export class CurrencyTransformer {
  format(currency: Currency) {
    return {
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      decimal: currency.decimal,
      isActive: currency.isActive,
    };
  }

  formatMany(currencies: Currency[]) {
    return currencies.map((c) => this.format(c));
  }
}
