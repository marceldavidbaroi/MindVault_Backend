import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsDateString } from 'class-validator';

export class ListTransactionsDto {
  @ApiPropertyOptional({ description: 'Account id to filter' })
  @IsOptional()
  accountId?: number;

  @ApiPropertyOptional({ description: 'Category id to filter' })
  @IsOptional()
  categoryId?: number;

  @ApiPropertyOptional({ description: 'Start date YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'End date YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ description: 'Transaction type' })
  @IsOptional()
  @IsString()
  type?: 'income' | 'expense';

  @ApiPropertyOptional({ description: 'Status' })
  @IsOptional()
  @IsString()
  status?: 'pending' | 'cleared' | 'void' | 'failed';

  @ApiPropertyOptional({ description: 'Page' })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Page size' })
  @IsOptional()
  pageSize?: number;
}
