import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MaxLength(50)
  name: string;

  @IsString()
  @MaxLength(50)
  displayName: string;

  @IsEnum(['income', 'expense'])
  type: 'income' | 'expense';
}
