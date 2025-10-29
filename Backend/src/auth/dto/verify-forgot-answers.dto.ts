// dto/verify-forgot-answers.dto.ts
import {
  IsString,
  IsArray,
  ValidateNested,
  MinLength,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

class AnswerItemDto {
  @IsInt()
  questionId: number;

  @IsString()
  @MinLength(1)
  answer: string;
}

export class VerifyForgotAnswersDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerItemDto)
  answers: AnswerItemDto[];

  @IsString()
  @MinLength(6)
  newPassword: string;
}
