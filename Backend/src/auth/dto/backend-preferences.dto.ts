// backend-preferences.dto.ts
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BackendPreferencesDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  notifications?: boolean;

  @ApiPropertyOptional({
    description: 'Additional custom backend preferences',
    example: { autoSync: false, timezone: 'Asia/Dhaka' },
  })
  @IsOptional()
  extra?: Record<string, any>;
}
