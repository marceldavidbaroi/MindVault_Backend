import {
  IsString,
  IsArray,
  ValidateNested,
  MinLength,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class AnswerItemDto {
  @ApiProperty({
    description: 'ID of the security question',
    example: 1,
  })
  @IsInt()
  questionId: number;

  @ApiProperty({
    description: 'Answer to the security question',
    minLength: 1,
    example: 'Blue',
  })
  @IsString()
  @MinLength(1)
  answer: string;
}

export class VerifyForgotAnswersDto {
  @ApiProperty({
    description: 'Username of the account',
    minLength: 3,
    example: 'john_doe',
  })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({
    description: 'Answers to the security questions',
    type: [AnswerItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerItemDto)
  answers: AnswerItemDto[];

  @ApiProperty({
    description: 'New password to reset',
    minLength: 6,
    example: 'NewP@ssw0rd!',
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
