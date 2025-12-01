// assign-role.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({
    example: 'john_doe',
    description: 'Username to assign the role to',
  })
  @IsString()
  username: string;

  @ApiProperty({ example: 2, description: 'Role ID assigned to the user' })
  @IsInt()
  roleId: number;
}
