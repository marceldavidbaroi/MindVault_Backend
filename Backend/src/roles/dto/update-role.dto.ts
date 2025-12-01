// src/roles/dto/update-role.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  // Optional: explicitly annotate fields if you want to override Swagger metadata
  @ApiPropertyOptional({ description: 'Role system name', example: 'admin' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Role display name',
    example: 'Administrator',
  })
  displayName?: string;

  @ApiPropertyOptional({
    description: 'Description of the role',
    example: 'Full administrative access',
  })
  description?: string;
}
