import {
  IsString,
  IsDecimal,
  IsDateString,
  IsInt,
  IsOptional,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSavingsGoalDto {
  @ApiPropertyOptional({
    description: 'The display name for the savings goal.',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'A detailed description or purpose of the goal.',
  })
  @IsString()
  @IsOptional()
  purpose?: string;

  @ApiPropertyOptional({
    description: 'The target amount to save (as a decimal string).',
  })
  @IsDecimal({ decimal_digits: '2' })
  @IsOptional()
  targetAmount?: string;

  @ApiPropertyOptional({
    description: 'The currency code (e.g., USD, EUR).',
  })
  @IsString()
  @IsOptional()
  currencyCode?: string;

  @ApiPropertyOptional({
    description: 'The ID of the account type to use for the goal account.',
  })
  @IsInt()
  @IsOptional()
  accountTypeId?: number;

  @ApiPropertyOptional({
    description: 'The optional target completion date.',
  })
  @IsDateString()
  @IsOptional()
  targetDate?: string;
}
