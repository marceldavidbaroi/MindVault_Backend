import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';
import { FrontendPreferencesDto } from './frontend-preferences.dto';
import { BackendPreferencesDto } from './backend-preferences.dto';

export class UpdatePreferencesDto {
  @ApiPropertyOptional({
    description: 'Frontend preferences of the user',
    type: 'object',
    allOf: [{ $ref: getSchemaPath(FrontendPreferencesDto) }],
    additionalProperties: false, // ✅ required by Swagger when type = 'object'
    example: {
      theme: 'dark',
      layout: 'grid',
      extra: {
        showSidebar: true,
        language: 'en',
      },
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => FrontendPreferencesDto)
  frontend?: FrontendPreferencesDto;

  @ApiPropertyOptional({
    description: 'Backend preferences of the user',
    type: 'object',
    allOf: [{ $ref: getSchemaPath(BackendPreferencesDto) }],
    additionalProperties: false, // ✅ fixes the TS error
    example: {
      notifications: true,
      extra: {
        autoSync: false,
        timezone: 'Asia/Dhaka',
      },
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BackendPreferencesDto)
  backend?: BackendPreferencesDto;
}
