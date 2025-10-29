import {
  IsDateString,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export class TransactionItemDto {
  @IsOptional() // category can be null
  @IsNumber({}, { message: 'CategoryId must be a valid number' })
  categoryId?: number;

  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(0, { message: 'Amount must be at least 0' })
  amount: number;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @Length(1, 255, {
    message: 'Description must be between 1 and 255 characters',
  })
  description?: string;
}

export class BulkTransactionDto {
  @IsDateString(
    {},
    {
      message: 'Transaction date must be a valid ISO date string (YYYY-MM-DD)',
    },
  )
  transactionDate: string; // renamed for consistency with entity

  @IsEnum(TransactionType, {
    message: 'Type must be either "income" or "expense"',
  })
  type: TransactionType;

  @IsNumber({}, { message: 'AccountId must be a valid number' })
  @IsNotEmpty({ message: 'AccountId is required' })
  accountId: number;

  @IsString({ message: 'CurrencyCode must be a string' })
  @IsNotEmpty({ message: 'CurrencyCode is required' })
  currencyCode: string;

  @IsArray({ message: 'Transactions must be an array' })
  @ValidateNested({ each: true })
  @Type(() => TransactionItemDto)
  transactions: TransactionItemDto[];
}
