import { IsString, MinLength, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSecurityQuestionDto {
  @ApiProperty({
    description: 'ID of the security question to update',
    example: 1,
  })
  @IsInt()
  questionId: number;

  @ApiProperty({
    description: 'The new text for the security question',
    minLength: 5,
    example: 'What is your favorite book?',
  })
  @IsString()
  @MinLength(5)
  question: string;

  @ApiProperty({
    description: 'The answer to the security question',
    minLength: 1,
    example: 'Harry Potter',
  })
  @IsString()
  @MinLength(1)
  answer: string;
}
