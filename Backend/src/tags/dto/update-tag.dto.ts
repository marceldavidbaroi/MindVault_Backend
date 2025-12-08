import { IsString, IsOptional, IsInt, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTagDto {
  @ApiPropertyOptional({
    description: 'Unique name of the tag in snake_case',
    example: 'important_note',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Display name of the tag',
    example: 'Important Note',
  })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({
    description: 'Optional description for the tag',
    example: 'Used for marking important notes',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Optional icon representing the tag',
    example: 'star',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Optional color code for the tag',
    example: '#ff0000',
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({
    description: 'Optional tag group ID to assign this tag',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  groupId?: number;
}
