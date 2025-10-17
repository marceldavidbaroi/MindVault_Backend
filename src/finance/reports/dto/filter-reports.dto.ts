import { IsOptional, IsEnum, Min, Max, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportType } from '../reports.enum';

export class FilterReportsDto {
  @IsOptional()
  @IsEnum(ReportType)
  reportType?: ReportType;

  @IsOptional()
  @Type(() => Number) // 👈 converts query string -> number
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number; // 1–12 only

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2)
  half?: 1 | 2; // only 1 or 2
}
