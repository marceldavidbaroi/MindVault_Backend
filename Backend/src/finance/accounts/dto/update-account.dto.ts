import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsInt } from 'class-validator';

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
    description: 'Optional new account type ID',
    required: false,
  })
  @IsOptional()
  @IsInt()
  typeId?: number;
}
