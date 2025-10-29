// dto/fetch-forgot-questions.dto.ts
import { IsString, MinLength } from 'class-validator';

export class FetchForgotQuestionsDto {
  @IsString()
  @MinLength(3)
  username: string;
}
