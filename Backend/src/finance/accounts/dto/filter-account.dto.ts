import { IsOptional, IsInt, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class FilterAccountDto {
  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number) // transform string to number
  @IsInt()
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number) // transform string to number
  @IsInt()
  limit?: number = 20;

  @ApiProperty({ description: 'Sort by field', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Sort order ASC or DESC',
    required: false,
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;

  @ApiProperty({ description: 'Search by account name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Relations to include as comma-separated values',
    required: false,
  })
  @IsOptional()
  @IsString()
  relations?: string;
}
