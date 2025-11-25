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
import { MonthlySummaryService } from '../services/monthly-summary.service';

@ApiTags('monthly-summaries')
@Controller('monthly-summaries')
@UseGuards(AuthGuard('jwt'))
export class MonthlySummaryController {
  constructor(private readonly monthlySummaryService: MonthlySummaryService) {}

  @Get(':accountId')
  @ApiOperation({ summary: 'Get monthly summary for an account' })
  @ApiParam({
    name: 'accountId',
    description: 'ID of the account',
    type: Number,
  })
  @ApiQuery({
    name: 'month',
    required: true,
    description: 'Month (1-12)',
    type: Number,
  })
  @ApiQuery({
    name: 'year',
    required: true,
    description: 'Year (e.g., 2025)',
    type: Number,
  })
  async getMonthlySummary(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    try {
      const data = await this.monthlySummaryService.getMonthlySummary(
        accountId,
        month,
        year,
      );

      return {
        success: true,
        message: 'Monthly summary retrieved successfully',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to retrieve monthly summary',
        data: null,
      };
    }
  }

  @Get(':accountId/comparison')
  @ApiOperation({ summary: 'Get monthly comparison for an account' })
  @ApiParam({
    name: 'accountId',
    description: 'ID of the account',
    type: Number,
  })
  @ApiQuery({
    name: 'month',
    required: true,
    description: 'Month (1-12)',
    type: Number,
  })
  @ApiQuery({
    name: 'year',
    required: true,
    description: 'Year (e.g., 2025)',
    type: Number,
  })
  async getMonthlyComparison(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    try {
      const data = await this.monthlySummaryService.getMonthlyComparison(
        accountId,
        month,
        year,
      );

      return {
        success: true,
        message: 'Monthly comparison retrieved successfully',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to retrieve monthly comparison',
        data: null,
      };
    }
  }

  @Get(':accountId/last-n-months')
  @ApiOperation({ summary: 'Get last N months of summaries for an account' })
  @ApiParam({
    name: 'accountId',
    description: 'ID of the account',
    type: Number,
  })
  @ApiQuery({
    name: 'n',
    required: true,
    description: 'Number of months to retrieve',
    type: Number,
  })
  async getLastNMonths(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query('n', ParseIntPipe) n: number,
  ) {
    try {
      const data = await this.monthlySummaryService.getLastNMonths(
        accountId,
        n,
      );

      return {
        success: true,
        message: `Last ${n} months of summaries retrieved successfully`,
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to retrieve last N months',
        data: null,
      };
    }
  }
}
