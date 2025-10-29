// dto/frontend-preferences.dto.ts
import { IsOptional, IsString, IsIn } from 'class-validator';

export class FrontendPreferencesDto {
  @IsOptional()
  @IsIn(['light', 'dark'])
  theme?: 'light' | 'dark';

  @IsOptional()
  @IsString()
  layout?: string;

  // Additional frontend preferences
  [key: string]: any;
}
