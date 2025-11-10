import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CurrencyService } from '../services/currency.service';
import { Currency } from '../entity/currency.entity';
import { ApiResponse } from 'src/common/types/api-response.type';

@ApiTags('Finance Currencies')
@Controller('finance/currencies')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get()
  @ApiOperation({ summary: 'List all supported currencies' })
  // The ApiResponse decorator reflects the inner data type for documentation purposes.
  async list(): Promise<ApiResponse<Currency[]>> {
    // FIX: Added 'await' to resolve the Promise returned by listCurrencies()
    const currencies = await this.currencyService.listCurrencies();

    return {
      success: true,
      message: 'Supported currencies listed successfully',
      data: currencies,
    };
  }
}
