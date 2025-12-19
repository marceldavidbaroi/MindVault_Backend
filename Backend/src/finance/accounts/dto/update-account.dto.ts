import { IsString, IsOptional, IsInt, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAccountDto {
  @ApiProperty({ example: 'Main Savings', description: 'Account display name' })
  @IsString()
  @IsOptional()
  @Length(2, 100)
  name?: string;

  @ApiProperty({
    example: 'Updated description',
    description: 'Description of the account',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 1, description: 'Account type ID' })
  @IsInt()
  @IsOptional()
  typeId?: number;

  @ApiProperty({ example: 'USD', description: 'Currency code' })
  @IsString()
  @IsOptional()
  @Length(3, 3)
  currencyCode?: string;
}
