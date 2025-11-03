import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCurrencyDto {
  @ApiProperty({ example: 'USD', description: 'Currency code' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'United States Dollar' })
  @IsString()
  name: string;

  @ApiProperty({ example: '$' })
  @IsString()
  symbol: string;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  decimal?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
