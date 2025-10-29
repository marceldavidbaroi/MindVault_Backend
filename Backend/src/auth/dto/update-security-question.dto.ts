// dto/update-security-question.dto.ts
import { IsString, MinLength, IsInt } from 'class-validator';

export class UpdateSecurityQuestionDto {
  @IsInt()
  questionId: number;

  @IsString()
  @MinLength(5)
  question: string;

  @IsString()
  @MinLength(1)
  answer: string;
}
