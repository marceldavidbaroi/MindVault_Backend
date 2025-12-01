// dto/create-security-question.dto.ts
import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSecurityQuestionDto {
  @ApiProperty({
    description: 'The security question to help reset the password',
    example: 'What was your first pet’s name?',
  })
  @IsString()
  @MinLength(5, { message: 'Question must be at least 5 characters' })
  question: string;

  @ApiProperty({
    description: 'Answer to the security question',
    example: 'Fluffy',
  })
  @IsString()
  @MinLength(1, { message: 'Answer cannot be empty' })
  answer: string;

  @ApiProperty({
    description: 'Current password of the user for verification',
    example: 'MySecretPassword123!',
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}
