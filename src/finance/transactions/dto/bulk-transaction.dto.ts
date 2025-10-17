import {
  IsDateString,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

class TransactionItemDto {
  @IsNumber({}, { message: 'CategoryId must be a valid ID' })
  @IsNotEmpty({ message: 'CategoryId is required' })
  categoryId: number;

  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(0, { message: 'Amount must be at least 0' })
  amount: number;
}

export class BulkTransactionDto {
  @IsDateString(
    {},
    { message: 'Date must be a valid ISO date string (YYYY-MM-DD)' },
  )
  date: string;

  @IsEnum(TransactionType, {
    message: 'Type must be either income or expense',
  })
  type: TransactionType;

  @IsArray({ message: 'Transactions must be an array' })
  @ValidateNested({ each: true })
  @Type(() => TransactionItemDto)
  transactions: TransactionItemDto[];
}
