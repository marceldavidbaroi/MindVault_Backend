// dto/delete-security-question.dto.ts
import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteSecurityQuestionDto {
  @ApiProperty({
    description:
      'Current password of the user for verification before deletion',
    example: 'MySecretPassword123!',
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}
