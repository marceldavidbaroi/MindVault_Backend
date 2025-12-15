import { IsString, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExchangeRateDto {
  @ApiProperty({ example: 'USD' })
  @IsString()
  from: string;

  @ApiProperty({ example: 'EUR' })
  @IsString()
  to: string;

  @ApiProperty({ example: 0.92 })
  @IsNumber()
  rate: number;

  @ApiProperty({ example: '2025-01-01' })
  @IsDateString()
  date: string;
}
