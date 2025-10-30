// frontend-preferences.dto.ts
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FrontendPreferencesDto {
  @ApiPropertyOptional({ example: 'dark', enum: ['light', 'dark'] })
  @IsOptional()
  @IsString()
  theme?: 'light' | 'dark';

  @ApiPropertyOptional({ example: 'grid' })
  @IsOptional()
  @IsString()
  layout?: string;

  // Optional catch-all field for custom preferences
  @ApiPropertyOptional({
    description: 'Additional custom frontend preferences',
    example: { showSidebar: true, language: 'en' },
  })
  @IsOptional()
  extra?: Record<string, any>;
}
