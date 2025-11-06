import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumberString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsString,
  IsDateString,
} from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ description: 'Account id where transaction will be posted' })
  @IsNotEmpty()
  accountId: number;

  @ApiProperty({ description: 'Creator user id' })
  @IsNotEmpty()
  creatorUserId: number;

  @ApiPropertyOptional({ description: 'Category id' })
  @IsOptional()
  categoryId?: number;

  @ApiProperty({ enum: ['income', 'expense'] })
  @IsEnum(['income', 'expense'])
  type: 'income' | 'expense';

  @ApiProperty({ description: 'Amount in decimal string (precision 18,2)' })
  @IsNotEmpty()
  @IsNumberString()
  amount: string;

  @ApiPropertyOptional({ description: 'Currency code id (FK)' })
  @IsOptional()
  currencyCode?: string;

  @ApiProperty({ description: 'Date of transaction (YYYY-MM-DD)' })
  @IsDateString()
  transactionDate: string;

  @ApiPropertyOptional({ description: 'Description or notes' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    enum: ['pending', 'cleared', 'void', 'failed'],
    default: 'pending',
  })
  @IsOptional()
  @IsEnum(['pending', 'cleared', 'void', 'failed'])
  status?: 'pending' | 'cleared' | 'void' | 'failed';

  @ApiPropertyOptional({ description: 'External reference id' })
  @IsOptional()
  @IsString()
  externalRefId?: string;

  @ApiPropertyOptional({ description: 'Is recurring?' })
  @IsOptional()
  @IsBoolean()
  recurring?: boolean;

  @ApiPropertyOptional({
    description: 'Recurring interval',
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
  })
  @IsOptional()
  @IsEnum(['daily', 'weekly', 'monthly', 'yearly'])
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}
