import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsDateString,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  type RecurringInterval,
  type TransactionType,
  type TransactionStatus,
} from '../transactions.entity';

export class CreateTransactionDto {
  @IsEnum(['income', 'expense'], {
    message: 'Type must be either "income" or "expense"',
  })
  @IsNotEmpty()
  type: TransactionType;

  @IsNumber({}, { message: 'Account ID must be a number' })
  @Type(() => Number)
  @IsNotEmpty({ message: 'Account ID is required' })
  accountId: number;

  @IsOptional()
  @IsNumber({}, { message: 'Category ID must be a number' })
  @Type(() => Number)
  categoryId?: number;

  @IsNumber({}, { message: 'Amount must be a valid number' })
  @IsNotEmpty({ message: 'Amount is required' })
  amount: number;

  @IsString()
  @Length(3, 3, { message: 'Currency code must be a 3-letter ISO 4217 code' })
  @IsNotEmpty({ message: 'Currency code is required' })
  currencyCode: string;

  @IsDateString({}, { message: 'Transaction date must be a valid ISO string' })
  @IsNotEmpty({ message: 'Transaction date is required' })
  transactionDate: string; // ✅ matches entity field

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

  @IsOptional()
  @IsEnum(['pending', 'cleared', 'void'], {
    message: 'Status must be one of: pending, cleared, void',
  })
  status?: TransactionStatus;
}
