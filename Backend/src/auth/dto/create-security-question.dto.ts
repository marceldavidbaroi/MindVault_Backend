// dto/create-security-question.dto.ts
import { IsString, MinLength } from 'class-validator';

export class CreateSecurityQuestionDto {
  @IsString()
  @MinLength(5)
  question: string;

  @IsString()
  @MinLength(1)
  answer: string;
}
