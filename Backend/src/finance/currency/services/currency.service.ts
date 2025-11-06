import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from '../entity/currency.entity';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepo: Repository<Currency>,
  ) {}

  async listCurrencies(): Promise<Currency[]> {
    return this.currencyRepo.find();
  }

  async verifyCurrency(code: string): Promise<Currency> {
    const currency = await this.currencyRepo.findOne({ where: { code } });
    if (!currency) throw new BadRequestException('Invalid currency code');
    return currency;
  }
}
