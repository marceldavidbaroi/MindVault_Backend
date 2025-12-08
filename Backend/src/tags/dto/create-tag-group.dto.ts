import { IsString, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTagGroupDto {
  @ApiProperty({
    description: 'Unique name for the tag group in snake_case',
    example: 'work_tasks',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty({
    description: 'Display name for the tag group',
    example: 'Work Tasks',
    minLength: 2,
    maxLength: 150,
  })
  @IsString()
  @Length(2, 150)
  displayName: string;

  @ApiPropertyOptional({
    description: 'Optional description for the tag group',
    example: 'Tasks related to office work and projects',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Optional icon name for the tag group',
    example: 'briefcase',
  })
  @IsOptional()
  @IsString()
  icon?: string;
}
