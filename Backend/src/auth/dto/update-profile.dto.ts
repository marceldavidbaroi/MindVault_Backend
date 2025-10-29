import { IsOptional, IsString, IsEmail, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'The username of the user',
    minLength: 2,
    example: 'john_doe',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  username?: string;

  @ApiPropertyOptional({
    description: 'The email address of the user',
    example: 'john@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  // Add more fields as needed with @ApiPropertyOptional
}
