import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import {
  type RecurringInterval,
  type TransactionType,
} from '../transactions.entity';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
  @IsEnum(['income', 'expense'], {
    message: 'Type must be either income or expense',
  })
  @IsNotEmpty()
  type: TransactionType;

  @IsNumber({}, { message: 'Category must be a valid ID' })
  @Type(() => Number) // <-- converts string to number automatically
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId: number;

  @IsNumber({}, { message: 'Amount must be a number' })
  @IsNotEmpty({ message: 'Amount is required' })
  amount: number;

  @IsDateString(
    {},
    { message: 'Date must be a valid ISO date string (YYYY-MM-DD)' },
  )
  @IsNotEmpty({ message: 'Date is required' })
  date: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'Recurring must be a boolean (true/false)' })
  recurring?: boolean;

  @IsOptional()
  @IsEnum(['daily', 'weekly', 'monthly', 'yearly'], {
    message:
      'Recurring interval must be one of: daily, weekly, monthly, yearly',
  })
  recurringInterval?: RecurringInterval;
}
