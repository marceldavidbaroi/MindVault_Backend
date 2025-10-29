import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FrontendPreferencesDto } from './frontend-preferences.dto';
import { BackendPreferencesDto } from './backend-preferences.dto';

export class UpdatePreferencesDto {
  @ApiPropertyOptional({
    description: 'Frontend preferences of the user',
    type: FrontendPreferencesDto,
    example: {
      theme: 'dark',
      layout: 'grid',
      customSetting: 'value',
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => FrontendPreferencesDto)
  frontend?: FrontendPreferencesDto;

  @ApiPropertyOptional({
    description: 'Backend preferences of the user',
    type: BackendPreferencesDto,
    example: {
      notifications: true,
      autoSync: false,
      customOption: 'value',
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BackendPreferencesDto)
  backend?: BackendPreferencesDto;
}
