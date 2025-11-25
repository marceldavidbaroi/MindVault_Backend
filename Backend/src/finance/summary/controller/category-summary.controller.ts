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
import { CategorySummaryService } from '../services/category-summary.service';

@ApiTags('category-summaries')
@Controller('category-summaries')
@UseGuards(AuthGuard('jwt'))
export class CategorySummaryController {
  constructor(
    private readonly categorySummaryService: CategorySummaryService,
  ) {}

  @Get(':accountId/daily')
  @ApiOperation({ summary: 'Get daily category summary for an account' })
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
      const data = await this.categorySummaryService.getDailyCategorySummary(
        accountId,
        refDate,
      );

      return {
        success: true,
        message: 'Daily category summary retrieved successfully',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to retrieve daily category summary',
        data: null,
      };
    }
  }

  @Get(':accountId/monthly')
  @ApiOperation({ summary: 'Get monthly category summary for an account' })
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
      const data = await this.categorySummaryService.getMonthlyCategorySummary(
        accountId,
        month,
        year,
      );

      return {
        success: true,
        message: 'Monthly category summary retrieved successfully',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to retrieve monthly category summary',
        data: null,
      };
    }
  }
}
