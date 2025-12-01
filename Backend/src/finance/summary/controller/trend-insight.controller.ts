import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TrendInsightService } from '../services/trend-insight.service';

@ApiTags('trend-insights')
@Controller('trend-insights')
@UseGuards(AuthGuard('jwt'))
export class TrendInsightController {
  constructor(private readonly trendService: TrendInsightService) {}

  @Get(':accountId/trend')
  @ApiOperation({ summary: 'Get income/expense trend for an account' })
  @ApiParam({
    name: 'accountId',
    description: 'ID of the account',
    type: Number,
  })
  @ApiQuery({
    name: 'period',
    required: true,
    description: 'Period for trend: daily, weekly, monthly, yearly',
    type: String,
  })
  @ApiQuery({
    name: 'n',
    required: true,
    description: 'Number of periods to retrieve',
    type: Number,
  })
  async getIncomeExpenseTrend(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query('period') period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    @Query('n', ParseIntPipe) n: number,
  ) {
    if (!['daily', 'weekly', 'monthly', 'yearly'].includes(period)) {
      throw new BadRequestException('Invalid period value');
    }

    try {
      const data = await this.trendService.getIncomeExpenseTrend(
        accountId,
        period,
        n,
      );

      return {
        success: true,
        message: `Income/expense trend for ${period} retrieved successfully`,
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to retrieve trend data',
        data: null,
      };
    }
  }

  @Get(':accountId/top-categories')
  @ApiOperation({ summary: 'Get top categories for an account' })
  @ApiParam({
    name: 'accountId',
    description: 'ID of the account',
    type: Number,
  })
  @ApiQuery({
    name: 'period',
    required: true,
    description: 'Period: daily or monthly',
    type: String,
  })
  @ApiQuery({
    name: 'dateOrMonth',
    required: true,
    description: 'Date in YYYY-MM-DD for daily or month (1-12) for monthly',
    type: String,
  })
  @ApiQuery({
    name: 'year',
    required: false,
    description: 'Year for monthly period (default current year)',
    type: Number,
  })
  async getTopCategories(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query('period') period: 'daily' | 'monthly',
    @Query('dateOrMonth') dateOrMonth: string | number,
    @Query('year', ParseIntPipe) year?: number,
  ) {
    if (!['daily', 'monthly'].includes(period)) {
      throw new BadRequestException('Invalid period value');
    }

    try {
      const data = await this.trendService.getTopCategories(
        accountId,
        period,
        dateOrMonth,
        year,
      );

      return {
        success: true,
        message: `Top categories for ${period} retrieved successfully`,
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to retrieve top categories',
        data: null,
      };
    }
  }
}
