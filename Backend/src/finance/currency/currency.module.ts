import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Currency } from './entity/currency.entity';
import { ExchangeRate } from './entity/exchange-rate.entity';
import { CurrencyService } from './services/currency.service';
import { ExchangeRateService } from './services/exchange-rate.service';
import { CurrencyController } from './controller/currency.controller';
import { ExchangeRateController } from './controller/exchange-rate.controller';
import { CurrencySeeder } from './currency.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([Currency, ExchangeRate])],
  controllers: [CurrencyController, ExchangeRateController],
  providers: [CurrencyService, ExchangeRateService, CurrencySeeder],
  exports: [CurrencyService, ExchangeRateService],
})
export class CurrencyModule {}
