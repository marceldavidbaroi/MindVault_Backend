import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Currency } from './currencies.entity';
import { CurrenciesService } from './currencies.service';
import { CurrenciesController } from './currencies.controller';
import { CurrenciesSeeder } from './currencies.seeder';
@Module({
  imports: [TypeOrmModule.forFeature([Currency])],
  providers: [CurrenciesSeeder, CurrenciesService],
  controllers: [CurrenciesController],
  exports: [CurrenciesService],
})
export class CurrenciesModule {}
