import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MasterComparisonSummaryService } from './services/master-comparison-summary.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('summaries')
@Controller('summaries')
@UseGuards(AuthGuard('jwt'))
export class SummariesController {
  constructor(
    private readonly masterSummaryService: MasterComparisonSummaryService,
  ) {}

  @Get(':accountId/comparison')
  @ApiOperation({ summary: 'Get all comparisons for an account' })
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
  async getAllComparisons(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query('date') date?: string,
  ) {
    const refDate = date || new Date().toISOString().slice(0, 10);

    try {
      const data = await this.masterSummaryService.getAllComparisons(
        accountId,
        refDate,
      );

      return {
        success: true,
        message: 'Comparison retrieved successfully',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to retrieve comparison',
        data: null,
      };
    }
  }
}
