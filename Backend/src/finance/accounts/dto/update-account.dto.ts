import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional } from 'class-validator';

export class UpdateAccountDto {
  @ApiProperty({ example: 'Updated Account Name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 2,
    description: 'Updated account type ID',
    required: false,
  })
  @IsOptional()
  @IsInt()
  accountTypeId?: number;

  @ApiProperty({
    example: 'USD',
    description: 'Updated currency code for the account',
    required: false,
  })
  @IsOptional()
  @IsString()
  currencyCode?: string;
}
