import {
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { type TransactionType } from '../transactions.entity';

export class FindTransactionsDto {
  @IsOptional()
  @IsEnum(['income', 'expense'], {
    message: 'Type must be either income or expense',
  })
  type?: TransactionType;

  @IsOptional()
  @Type(() => Number) // <-- converts string to number automatically
  @IsNumber({}, { message: 'CategoryId must be a valid ID' })
  categoryId?: number;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'startDate must be a valid ISO date string (YYYY-MM-DD)' },
  )
  startDate?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'endDate must be a valid ISO date string (YYYY-MM-DD)' },
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
