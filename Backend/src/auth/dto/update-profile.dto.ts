import { IsOptional, IsString, IsEmail, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'The email address of the user',
    example: 'john@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  // Add more fields as needed with @ApiPropertyOptional
}
