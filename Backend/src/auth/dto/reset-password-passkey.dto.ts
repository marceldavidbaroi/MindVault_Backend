// dto/reset-password-passkey.dto.ts
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordWithPasskeyDto {
  @IsString()
  passkey: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
