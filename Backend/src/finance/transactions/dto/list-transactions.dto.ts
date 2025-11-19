import { IsOptional, IsString, IsNumber, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import * as transactionEntity from '../entities/transaction.entity';

export class ListTransactionsFilterDto {
  @IsOptional()
  @Type(() => Number)
  categoryId?: number;

  @IsOptional()
  @IsIn(['income', 'expense'])
  type?: transactionEntity.TransactionType;

  @IsOptional()
  @IsIn(['pending', 'cleared', 'void', 'failed'])
  status?: transactionEntity.TransactionStatus;

  @IsOptional()
  @Type(() => Number)
  creatorUserId?: number;

  @IsOptional()
  @IsString()
  from?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  to?: string; // YYYY-MM-DD

  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  pageSize?: number;

  @IsOptional()
  @IsIn([
    'transactionDate',
    'amount',
    'type',
    'status',
    'externalRefId',
    'id',
    'createdAt',
    'updatedAt',
  ])
  sortBy?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}
