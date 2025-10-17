import { IsOptional, IsEnum } from 'class-validator';

export class FilterCategoriesDto {
  @IsOptional()
  @IsEnum(['system', 'user'], {
    message: "type must be either 'system' or 'user'",
  })
  ownership?: 'system' | 'user';

  @IsOptional()
  @IsEnum(['income', 'expense'], {
    message: "categoryType must be either 'income' or 'expense'",
  })
  categoryType?: 'income' | 'expense';
}
