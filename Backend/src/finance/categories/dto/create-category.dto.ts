import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { CategoryType, CategoryScope } from '../categories.entity';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category name', maxLength: 50 })
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Display name for UI',
    required: false,
    maxLength: 50,
  })
  @IsOptional()
  @MaxLength(50)
  displayName?: string;

  @ApiProperty({
    description: 'Transaction type',
    enum: CategoryType,
    enumName: 'CategoryType',
  })
  @IsEnum(CategoryType)
  type: CategoryType;

  @ApiProperty({
    description: 'Category ownership scope',
    enum: CategoryScope,
    enumName: 'CategoryScope',
    required: false,
  })
  @IsOptional()
  @IsEnum(CategoryScope)
  scope?: CategoryScope;
}
