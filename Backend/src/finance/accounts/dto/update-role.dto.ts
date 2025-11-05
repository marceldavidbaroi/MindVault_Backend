// update-role.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({ example: 1, description: 'New role ID for the user' })
  @IsInt()
  roleId: number;
}
