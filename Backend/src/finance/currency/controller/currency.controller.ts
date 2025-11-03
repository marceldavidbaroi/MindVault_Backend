import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrencyService } from '../services/currency.service';
import { Currency } from '../entity/currency.entity';

@ApiTags('Currencies')
@Controller('currencies')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get()
  @ApiOperation({ summary: 'List all supported currencies' })
  @ApiResponse({ status: 200, type: [Currency] })
  async list(): Promise<Currency[]> {
    return this.currencyService.listCurrencies();
  }
}
