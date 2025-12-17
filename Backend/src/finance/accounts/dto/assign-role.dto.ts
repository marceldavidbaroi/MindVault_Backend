import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({ example: 2 })
  @IsInt()
  roleId: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  userId: number;
}
