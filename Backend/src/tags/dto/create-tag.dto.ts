import { IsString, IsOptional, IsInt, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({
    description: 'Unique name for the tag in snake_case',
    example: 'urgent_task',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty({
    description: 'Display name for the tag',
    example: 'Urgent Task',
    minLength: 2,
    maxLength: 150,
  })
  @IsString()
  @Length(2, 150)
  displayName: string;

  @ApiPropertyOptional({
    description: 'Optional description for the tag',
    example: 'Tasks that need immediate attention',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Optional icon name for the tag',
    example: 'alert-circle',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Optional color for the tag in HEX or named color',
    example: '#ff0000',
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({
    description: 'Optional ID of the tag group this tag belongs to',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  groupId?: number;
}
