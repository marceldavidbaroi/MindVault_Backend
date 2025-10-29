import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'The current password of the user',
    example: 'OldPassword@123',
  })
  @IsString()
  @MinLength(6, { message: 'Old password must be at least 6 characters' })
  oldPassword: string;

  @ApiProperty({
    description: 'The new password to set (must meet strength requirements)',
    example: 'NewPassword@456',
  })
  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters' })
  newPassword: string;
}
