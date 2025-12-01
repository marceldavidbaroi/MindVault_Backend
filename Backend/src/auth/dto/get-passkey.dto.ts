import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetPasskeyDto {
  @ApiProperty({
    description:
      'The password of the user to verify before retrieving the passkey',
    minLength: 6,
    maxLength: 128,
    example: 'MySecurePassword123!',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password: string;
}
