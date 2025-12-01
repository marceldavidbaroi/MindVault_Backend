import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsInt } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({ example: 'Main Checking', description: 'Account name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Primary checking account', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 1000,
    description: 'Initial balance',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  initialBalance?: number;

  @ApiProperty({ example: 1, description: 'Account type ID' })
  @IsInt()
  accountTypeId: number; // renamed to match entity

  @ApiProperty({ example: 'USD', description: 'Currency code for the account' })
  @IsString()
  currencyCode: string;
}
