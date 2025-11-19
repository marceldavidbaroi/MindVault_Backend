import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsEnum,
  IsString,
} from 'class-validator';

export class CreateLedgerEntryDto {
  @IsNumber()
  accountId: number;

  @IsNumber()
  creatorId: number;

  @IsEnum(['income', 'expense'])
  entryType: 'income' | 'expense';

  @IsPositive()
  amount: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  transactionId?: number;
}
