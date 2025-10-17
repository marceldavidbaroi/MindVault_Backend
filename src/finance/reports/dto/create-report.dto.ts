import { IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportType } from '../reports.enum';

export class CreateReportDto {
  @IsEnum(ReportType, {
    message: 'Report type must be monthly, half_yearly, or yearly',
  })
  reportType: ReportType; // ✅ camelCase

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  month?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  half?: 1 | 2;
}
