import {
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsNumber,
  IsString,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  type TransactionType,
  type TransactionStatus,
} from '../transactions.entity';

export class FindTransactionsDto {
  @IsOptional()
  @IsEnum(['income', 'expense'], {
    message: 'Type must be either "income" or "expense"',
  })
  type?: TransactionType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Account ID must be a valid number' })
  accountId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Category ID must be a valid number' })
  categoryId?: number;

  @IsOptional()
  @IsString({ message: 'Currency code must be a string' })
  @Length(3, 3, { message: 'Currency code must be a 3-letter ISO 4217 code' })
  currencyCode?: string;

  @IsOptional()
  @IsEnum(['pending', 'cleared', 'void'], {
    message: 'Status must be one of: pending, cleared, void',
  })
  status?: TransactionStatus;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'startDate must be a valid ISO date (YYYY-MM-DD)' },
  )
  startDate?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'endDate must be a valid ISO date (YYYY-MM-DD)' },
  )
  endDate?: string;

  // Pagination
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit: number = 25;
}
