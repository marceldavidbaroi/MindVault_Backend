import { IsOptional, IsNumberString } from 'class-validator';

export class BudgetAlertsDto {
  @IsOptional()
  @IsNumberString({}, { message: 'threshold must be a numeric string' })
  threshold?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'month must be a numeric string' })
  month?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'year must be a numeric string' })
  year?: string;
}
