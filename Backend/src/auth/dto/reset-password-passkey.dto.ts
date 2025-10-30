// dto/reset-password-passkey.dto.ts
import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordWithPasskeyDto {
  @ApiProperty({
    description: 'Username of the user whose password is being reset',
    example: 'David',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'The passkey sent to the user for password reset',
    example: 'a1b2c3d4e5f6',
  })
  @IsString()
  passkey: string;

  @ApiProperty({
    description: 'New password for the user',
    example: 'NewP@ssw0rd123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
