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
import { DailySummaryService } from '../services/daily-summary.service';

@ApiTags('daily-summaries')
@Controller('daily-summaries')
@UseGuards(AuthGuard('jwt'))
export class DailySummaryController {
  constructor(private readonly dailySummaryService: DailySummaryService) {}

  @Get(':accountId')
  @ApiOperation({ summary: 'Get daily summary for an account' })
  @ApiParam({
    name: 'accountId',
    description: 'ID of the account',
    type: Number,
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Date in YYYY-MM-DD format (default today)',
    type: String,
  })
  async getDailySummary(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query('date') date?: string,
  ) {
    const refDate = date || new Date().toISOString().slice(0, 10);

    try {
      const data = await this.dailySummaryService.getDailySummary(
        accountId,
        refDate,
      );

      return {
        success: true,
        message: 'Daily summary retrieved successfully',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to retrieve daily summary',
        data: null,
      };
    }
  }

  @Get(':accountId/comparison')
  @ApiOperation({ summary: 'Get daily comparison for an account' })
  @ApiParam({
    name: 'accountId',
    description: 'ID of the account',
    type: Number,
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Reference date in YYYY-MM-DD (default today)',
    type: String,
  })
  async getDailyComparison(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query('date') date?: string,
  ) {
    const refDate = date || new Date().toISOString().slice(0, 10);

    try {
      const data = await this.dailySummaryService.getDailyComparison(
        accountId,
        refDate,
      );

      return {
        success: true,
        message: 'Daily comparison retrieved successfully',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to retrieve daily comparison',
        data: null,
      };
    }
  }

  @Get(':accountId/last-n-days')
  @ApiOperation({
    summary: 'Get last N days of daily summaries for an account',
  })
  @ApiParam({
    name: 'accountId',
    description: 'ID of the account',
    type: Number,
  })
  @ApiQuery({
    name: 'n',
    required: true,
    description: 'Number of days to retrieve',
    type: Number,
  })
  async getLastNDays(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query('n', ParseIntPipe) n: number,
  ) {
    try {
      const data = await this.dailySummaryService.getLastNDays(accountId, n);

      return {
        success: true,
        message: `Last ${n} days of daily summaries retrieved successfully`,
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to retrieve last N days',
        data: null,
      };
    }
  }
}
