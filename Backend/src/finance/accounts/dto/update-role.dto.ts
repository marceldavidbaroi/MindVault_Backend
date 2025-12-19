import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({
    example: 2,
    description:
      'The ID of the role to be assigned to the user (e.g., 1 for Owner, 2 for Editor, 3 for Viewer)',
    type: Number,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  roleId: number;
}
