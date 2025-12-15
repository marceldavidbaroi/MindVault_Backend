import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Currency } from './entity/currency.entity';

import { CurrencyController } from './controller/currency.controller';

import { CurrencyService } from './services/currency.service';
import { CurrencyRepository } from './repository/currency.repository';
import { CurrencyValidator } from './validators/currency.validator';
import { CurrencyTransformer } from './transformers/currency.transformer';
import { CurrencySeeder } from './seeder/currency.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([Currency])],

  controllers: [CurrencyController],

  providers: [
    // DB layer
    CurrencyRepository,

    // Domain logic
    CurrencyService,
    CurrencyValidator,
    CurrencyTransformer,

    // CLI only
    CurrencySeeder,
  ],

  // 🔥 Only export what OTHER modules should use
  exports: [CurrencyValidator],
})
export class CurrencyModule {}
