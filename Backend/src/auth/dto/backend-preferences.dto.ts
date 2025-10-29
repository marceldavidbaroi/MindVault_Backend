import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BackendPreferencesDto {
  @ApiPropertyOptional({
    description: 'Enable or disable user notifications',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  notifications?: boolean;

  [key: string]: any;
}
