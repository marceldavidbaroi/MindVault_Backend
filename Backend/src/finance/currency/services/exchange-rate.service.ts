import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeRate } from '../entity/exchange-rate.entity';
import { CreateExchangeRateDto } from '../dto/create-exchange-rate.dto';
import { FilterExchangeRateDto } from '../dto/filter-exchange-rate.dto';
import { Currency } from '../entity/currency.entity';

@Injectable()
export class ExchangeRateService {
  constructor(
    @InjectRepository(ExchangeRate)
    private readonly rateRepo: Repository<ExchangeRate>,
    @InjectRepository(Currency)
    private readonly currencyRepo: Repository<Currency>,
  ) {}

  async updateRate(dto: CreateExchangeRateDto): Promise<ExchangeRate> {
    const { from, to, rate, date } = dto;
    const fromCurrency = await this.currencyRepo.findOne({
      where: { code: from },
    });
    const toCurrency = await this.currencyRepo.findOne({ where: { code: to } });

    if (!fromCurrency || !toCurrency) {
      throw new NotFoundException('Currency not found');
    }

    const exchangeRate = this.rateRepo.create({
      fromCurrency,
      toCurrency,
      rate,
      date,
    });
    return this.rateRepo.save(exchangeRate);
  }

  async getRate(filters: FilterExchangeRateDto): Promise<ExchangeRate[]> {
    return this.rateRepo.find({
      where: {
        fromCurrency: { code: filters.from },
        toCurrency: { code: filters.to },
        date: filters.date,
      },
      relations: ['fromCurrency', 'toCurrency'],
    });
  }
}
