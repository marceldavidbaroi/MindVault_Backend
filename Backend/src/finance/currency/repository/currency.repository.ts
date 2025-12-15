import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from '../entity/currency.entity';

@Injectable()
export class CurrencyRepository {
  constructor(
    @InjectRepository(Currency)
    private readonly repo: Repository<Currency>,
  ) {}

  findAllPublic() {
    return this.repo.find({
      select: ['code', 'name', 'symbol', 'decimal', 'isActive'],
    });
  }

  findByCode(code: string) {
    return this.repo.findOne({ where: { code } });
  }
}
