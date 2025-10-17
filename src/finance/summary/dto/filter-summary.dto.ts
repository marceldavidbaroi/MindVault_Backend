import { IsIn, IsOptional, Matches } from 'class-validator';

export class GenerateReportDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'startDate must be in YYYY-MM-DD format',
  })
  startDate: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  endDate?: string;

  @IsIn(['daily', 'monthly', 'yearly', 'detailed'], {
    message: 'detailLevel must be one of: daily, monthly, yearly, detailed',
  })
  detailLevel: 'daily' | 'monthly' | 'yearly' | 'detailed';
}
