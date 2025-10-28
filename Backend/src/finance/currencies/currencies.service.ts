import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from './currencies.entity';

@Injectable()
export class CurrenciesService {
  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepo: Repository<Currency>,
  ) {}

  /** GET ALL */
  async findAll(): Promise<Currency[]> {
    return this.currencyRepo.find({
      where: { isActive: true },
      order: { code: 'ASC' },
    });
  }
}
