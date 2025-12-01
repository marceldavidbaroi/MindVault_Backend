// dto/fetch-forgot-questions.dto.ts
import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FetchForgotQuestionsDto {
  @ApiProperty({
    description: 'The username of the account to fetch security questions for',
    example: 'john_doe',
  })
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  username: string;
}
