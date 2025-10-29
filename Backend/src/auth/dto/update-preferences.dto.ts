// dto/update-preferences.dto.ts
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FrontendPreferencesDto } from './frontend-preferences.dto';
import { BackendPreferencesDto } from './backend-preferences.dto';

export class UpdatePreferencesDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => FrontendPreferencesDto)
  frontend?: FrontendPreferencesDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BackendPreferencesDto)
  backend?: BackendPreferencesDto;
}
