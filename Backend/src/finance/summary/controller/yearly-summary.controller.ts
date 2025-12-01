import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { YearlySummaryService } from '../services/yearly-summary.service';

@ApiTags('yearly-summaries')
@Controller('yearly-summaries')
@UseGuards(AuthGuard('jwt'))
export class YearlySummaryController {
  constructor(private readonly yearlySummaryService: YearlySummaryService) {}

  @Get(':accountId')
  @ApiOperation({ summary: 'Get yearly summary for an account' })
  @ApiParam({
    name: 'accountId',
    description: 'ID of the account',
    type: Number,
  })
  @ApiQuery({
    name: 'year',
    required: true,
    description: 'Year (e.g., 2025)',
    type: Number,
  })
  async getYearlySummary(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    try {
      const data = await this.yearlySummaryService.getYearlySummary(
        accountId,
        year,
      );

      return {
        success: true,
        message: 'Yearly summary retrieved successfully',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to retrieve yearly summary',
        data: null,
      };
    }
  }

  @Get(':accountId/comparison')
  @ApiOperation({ summary: 'Get yearly comparison for an account' })
  @ApiParam({
    name: 'accountId',
    description: 'ID of the account',
    type: Number,
  })
  @ApiQuery({
    name: 'year',
    required: true,
    description: 'Year (e.g., 2025)',
    type: Number,
  })
  async getYearlyComparison(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    try {
      const data = await this.yearlySummaryService.getYearlyComparison(
        accountId,
        year,
      );

      return {
        success: true,
        message: 'Yearly comparison retrieved successfully',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to retrieve yearly comparison',
        data: null,
      };
    }
  }

  @Get(':accountId/last-n-years')
  @ApiOperation({ summary: 'Get last N years of summaries for an account' })
  @ApiParam({
    name: 'accountId',
    description: 'ID of the account',
    type: Number,
  })
  @ApiQuery({
    name: 'n',
    required: true,
    description: 'Number of years to retrieve',
    type: Number,
  })
  async getLastNYears(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query('n', ParseIntPipe) n: number,
  ) {
    try {
      const data = await this.yearlySummaryService.getLastNYears(accountId, n);

      return {
        success: true,
        message: `Last ${n} years of summaries retrieved successfully`,
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to retrieve last N years',
        data: null,
      };
    }
  }
}
