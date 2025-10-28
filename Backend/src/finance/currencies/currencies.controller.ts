import { Controller, Get } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { Currency } from './currencies.entity';
import { ApiResponse } from 'src/common/types/api-response.type';

@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  /** GET ALL CURRENCIES */
  @Get()
  async getAll(): Promise<ApiResponse<Currency[]>> {
    try {
      const currencies = await this.currenciesService.findAll();
      return {
        success: true,
        message: 'Currencies fetched successfully',
        data: currencies,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to fetch currencies',
        data: null,
      };
    }
  }
}
