// dto/backend-preferences.dto.ts
import { IsOptional, IsBoolean } from 'class-validator';

export class BackendPreferencesDto {
  @IsOptional()
  @IsBoolean()
  notifications?: boolean;

  // Additional backend preferences
  [key: string]: any;
}
