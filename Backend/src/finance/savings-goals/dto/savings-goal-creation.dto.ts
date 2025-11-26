import {
  IsString,
  IsDecimal,
  IsDateString,
  IsNotEmpty,
  IsInt,
  IsOptional, // Added IsOptional
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSavingsGoalDto {
  @ApiProperty({ description: 'The display name for the savings goal.' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'A detailed description or purpose of the goal.',
    required: false,
  })
  @IsString()
  @IsOptional()
  purpose?: string; // New field added

  @ApiProperty({
    description: 'The target amount to save (as a decimal string).',
  })
  @IsDecimal({ decimal_digits: '2' })
  @IsNotEmpty()
  targetAmount: string;

  @ApiProperty({ description: 'The currency code (e.g., USD, EUR).' })
  @IsString()
  @IsNotEmpty()
  currencyCode: string;

  @ApiProperty({
    description: 'The ID of the account type to use for the new goal account.',
  })
  @IsInt()
  @IsNotEmpty()
  accountTypeId: number;

  @ApiProperty({
    description: 'The optional target completion date.',
    required: false,
  })
  @IsDateString()
  @IsOptional() // Added @IsOptional for targetDate as it is optional in the entity
  targetDate?: string;
}
