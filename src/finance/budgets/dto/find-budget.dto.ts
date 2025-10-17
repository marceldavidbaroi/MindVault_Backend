import {
  IsEnum,
  IsInt,
  IsOptional,
  Min,
  Max,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FindBudgetsDto {
  @IsOptional()
  @IsNumber({}, { message: 'Category must be a valid ID' })
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month?: number;

  @IsOptional()
  @IsInt()
  @Min(2000)
  @Type(() => Number)
  year?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 25;
}
