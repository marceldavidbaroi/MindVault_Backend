// dto/frontend-preferences.dto.ts
import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FrontendPreferencesDto {
  @ApiPropertyOptional({
    description: 'UI theme preference',
    enum: ['light', 'dark'],
    example: 'dark',
  })
  @IsOptional()
  @IsIn(['light', 'dark'])
  theme?: 'light' | 'dark';

  @ApiPropertyOptional({
    description: 'Layout preference for the frontend',
    example: 'grid',
  })
  @IsOptional()
  @IsString()
  layout?: string;

  // Additional frontend preferences
  [key: string]: any;
}
