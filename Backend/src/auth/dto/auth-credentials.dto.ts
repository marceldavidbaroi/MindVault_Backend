import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class authCredentialsDto {
  @ApiProperty({
    description: 'Username of the user (3–20 characters)',
    example: 'david',
  })
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  @MaxLength(20, { message: 'Username must be at most 20 characters' })
  username: string;

  @ApiProperty({
    description:
      'Strong password (must contain uppercase, lowercase, number, and special character)',
    example: 'David@123',
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(50, { message: 'Password must be at most 50 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        'Password too weak. Must contain uppercase, lowercase, number, and special character',
    },
  )
  password: string;
}
