import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ExchangeRateService } from '../services/exchange-rate.service';
import { CreateExchangeRateDto } from '../dto/create-exchange-rate.dto';
import { FilterExchangeRateDto } from '../dto/filter-exchange-rate.dto';
import { ExchangeRate } from '../entity/exchange-rate.entity';

@ApiTags('Exchange Rates')
@Controller('exchange-rates')
export class ExchangeRateController {
  constructor(private readonly rateService: ExchangeRateService) {}

  @Post()
  @ApiOperation({ summary: 'Update or create an exchange rate' })
  @ApiResponse({ status: 201, type: ExchangeRate })
  async create(@Body() dto: CreateExchangeRateDto): Promise<ExchangeRate> {
    return this.rateService.updateRate(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get exchange rates with filters' })
  @ApiResponse({ status: 200, type: [ExchangeRate] })
  async get(@Query() filters: FilterExchangeRateDto): Promise<ExchangeRate[]> {
    return this.rateService.getRate(filters);
  }
}
