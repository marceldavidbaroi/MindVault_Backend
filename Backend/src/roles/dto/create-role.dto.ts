// src/roles/dto/create-role.dto.ts
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Role system name',
    example: 'admin',
    required: true,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Role display name',
    example: 'Administrator',
    required: false,
  })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiProperty({
    description: 'Description of the role',
    example: 'Full administrative access',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
