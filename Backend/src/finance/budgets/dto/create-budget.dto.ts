import {
  IsEnum,
  IsNumber,
  IsInt,
  IsPositive,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';

export class CreateBudgetDto {
  @IsNumber({}, { message: 'Category must be a valid ID' })
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(1900) // adjust as needed
  year: number;
}
