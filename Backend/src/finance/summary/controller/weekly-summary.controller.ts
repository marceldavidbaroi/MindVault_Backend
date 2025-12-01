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
import { WeeklySummaryService } from '../services/weekly-summary.service';

@ApiTags('weekly-summaries')
@Controller('weekly-summaries')
@UseGuards(AuthGuard('jwt'))
export class WeeklySummaryController {
  constructor(private readonly weeklySummaryService: WeeklySummaryService) {}

  @Get(':accountId')
  @ApiOperation({ summary: 'Get weekly summary for an account' })
  @ApiParam({
    name: 'accountId',
    description: 'ID of the account',
    type: Number,
  })
  @ApiQuery({
    name: 'weekStart',
    required: true,
    description: 'Start date of the week in YYYY-MM-DD format',
    type: String,
  })
  async getWeeklySummary(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query('weekStart') weekStart: string,
  ) {
    try {
      const data = await this.weeklySummaryService.getWeeklySummary(
        accountId,
        weekStart,
      );

      return {
        success: true,
        message: 'Weekly summary retrieved successfully',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to retrieve weekly summary',
        data: null,
      };
    }
  }

  @Get(':accountId/comparison')
  @ApiOperation({ summary: 'Get weekly comparison for an account' })
  @ApiParam({
    name: 'accountId',
    description: 'ID of the account',
    type: Number,
  })
  @ApiQuery({
    name: 'weekStart',
    required: true,
    description: 'Start date of the week in YYYY-MM-DD format',
    type: String,
  })
  async getWeeklyComparison(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query('weekStart') weekStart: string,
  ) {
    try {
      const data = await this.weeklySummaryService.getWeeklyComparison(
        accountId,
        weekStart,
      );

      return {
        success: true,
        message: 'Weekly comparison retrieved successfully',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to retrieve weekly comparison',
        data: null,
      };
    }
  }

  @Get(':accountId/last-n-weeks')
  @ApiOperation({ summary: 'Get last N weeks of summaries for an account' })
  @ApiParam({
    name: 'accountId',
    description: 'ID of the account',
    type: Number,
  })
  @ApiQuery({
    name: 'n',
    required: true,
    description: 'Number of weeks to retrieve',
    type: Number,
  })
  async getLastNWeeks(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query('n', ParseIntPipe) n: number,
  ) {
    try {
      const data = await this.weeklySummaryService.getLastNWeeks(accountId, n);

      return {
        success: true,
        message: `Last ${n} weeks of summaries retrieved successfully`,
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to retrieve last N weeks',
        data: null,
      };
    }
  }
}
