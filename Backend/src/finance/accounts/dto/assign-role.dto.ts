// assign-role.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({ example: 2, description: 'User ID to assign the role to' })
  @IsInt()
  userId: number;

  @ApiProperty({ example: 1, description: 'Role ID assigned to the user' })
  @IsInt()
  roleId: number;
}
