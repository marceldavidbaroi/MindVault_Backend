import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({ example: 'Main Savings', description: 'Account display name' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @ApiProperty({
    example: 'Personal savings account',
    description: 'Description of the account',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 1, description: 'Account type ID' })
  @IsInt()
  typeId: number;

  @ApiProperty({ example: 'USD', description: 'Currency code' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  currencyCode: string;

  @ApiProperty({ example: 0, description: 'Initial balance' })
  @IsOptional()
  initialBalance?: string;
}
