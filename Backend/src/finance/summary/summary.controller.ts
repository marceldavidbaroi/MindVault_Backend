import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SummaryService } from './summary.service';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { ApiResponse } from 'src/common/types/api-response.type';
import { GenerateReportDto } from './dto/filter-summary.dto';

@Controller('summary')
@UseGuards(AuthGuard('jwt'))
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  /**
   * GET /summary/report
   * Query params:
   * startDate=YYYY-MM-DD
   * endDate=YYYY-MM-DD (optional)
   * detailLevel=daily|monthly|yearly|detailed
   */
  @Get()
  async getReport(
    @Query() query: GenerateReportDto,
    @GetUser() user: User,
  ): Promise<ApiResponse<any>> {
    const report = await this.summaryService.generateReport(user.id, query);
    return {
      success: true,
      message: 'Report generated successfully',
      data: report,
    };
  }

  @Get('transaction-dashboard')
  async getTransactionDashboardSummary(
    @GetUser() user: User,
  ): Promise<ApiResponse<any>> {
    const data = await this.summaryService.getTransactionDashboardSummary(
      user.id,
    );
    return {
      success: true,
      message: 'Dashboard summary fetched successfully',
      data,
    };
  }
}
