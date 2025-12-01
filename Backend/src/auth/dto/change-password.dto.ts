import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'The current password of the user',
    example: 'OldPassword@123',
  })
  @IsString()
  @MinLength(6, { message: 'Old password must be at least 6 characters' })
  @Transform(({ value }) => value?.trim())
  oldPassword: string;

  @ApiProperty({
    description:
      'The new password to set (min 6 chars, must include uppercase, lowercase, number, special char)',
    example: 'NewPassword@456',
  })
  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message:
      'New password must include uppercase, lowercase, number, and special character',
  })
  @Transform(({ value }) => value?.trim())
  newPassword: string;
}
