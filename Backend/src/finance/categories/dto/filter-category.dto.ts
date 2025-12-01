import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CategoryType, CategoryScope } from '../categories.entity';

export class FilterCategoryDto {
  @ApiPropertyOptional({
    enum: CategoryType,
    description: 'Filter by transaction type',
  })
  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;

  @ApiPropertyOptional({
    enum: CategoryScope,
    description: 'Filter by category scope',
  })
  @IsOptional()
  @IsEnum(CategoryScope)
  scope?: CategoryScope;

  @ApiPropertyOptional({ description: 'Search by name or display name' })
  @IsOptional()
  @IsString()
  search?: string;
}
