import { IsString, IsOptional, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTagGroupDto {
  @ApiPropertyOptional({
    description: 'Unique name of the tag group in snake_case',
    example: 'personal_notes',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Display name of the tag group',
    example: 'Personal Notes',
  })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({
    description: 'Optional description of the tag group',
    example: 'Tags related to personal notes and reflections',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Optional icon representing the tag group',
    example: 'folder',
  })
  @IsOptional()
  @IsString()
  icon?: string;
}
