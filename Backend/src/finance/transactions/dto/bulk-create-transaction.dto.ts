import {
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
  IsDateString,
  IsString,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BulkTransactionItemDto {
  @ApiProperty({
    description: 'Transaction amount as string to preserve precision',
    example: '150.50',
    type: String,
  })
  @IsString()
  amount: string;

  @ApiPropertyOptional({ description: 'Category ID', example: 3 })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({
    description: 'Transaction date YYYY-MM-DD',
    example: '2025-11-21',
  })
  @IsOptional()
  @IsDateString()
  transactionDate?: string;

  @ApiPropertyOptional({
    description: 'External reference ID',
    example: 'REF12345',
  })
  @IsOptional()
  @IsString()
  externalRefId?: string;
}

export class BulkCreateTransactionDto {
  @ApiProperty({ description: 'Account ID for all transactions', example: 1 })
  @IsNumber()
  accountId: number;

  @ApiPropertyOptional({
    description: 'Transaction type',
    enum: ['income', 'expense'],
    example: 'expense',
  })
  @IsOptional()
  @IsIn(['income', 'expense'])
  type?: 'income' | 'expense';

  @ApiPropertyOptional({ description: 'Currency code', example: 'USD' })
  @IsOptional()
  @IsString()
  currencyCode?: string;

  @ApiPropertyOptional({
    description: 'Description for all transactions',
    example: 'Monthly expenses',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Transaction status',
    enum: ['pending', 'completed', 'failed'],
    example: 'pending',
  })
  @IsOptional()
  @IsIn(['pending', 'completed', 'failed'])
  status?: 'pending' | 'completed' | 'failed';

  @ApiPropertyOptional({ description: 'Recurring flag', example: false })
  @IsOptional()
  @IsBoolean()
  recurring?: boolean;

  @ApiPropertyOptional({
    description: 'Recurring interval',
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    example: 'monthly',
  })
  @IsOptional()
  @IsIn(['daily', 'weekly', 'monthly', 'yearly'])
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';

  @ApiProperty({
    description: 'List of transactions',
    type: [BulkTransactionItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkTransactionItemDto)
  transactions: BulkTransactionItemDto[];
}
