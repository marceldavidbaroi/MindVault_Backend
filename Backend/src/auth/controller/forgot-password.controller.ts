import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { ForgotPasswordService } from '../services/forgot-password.service';
import type { ApiResponse } from 'src/common/types/api-response.type';
import { VerifyForgotAnswersDto } from '../dto/verify-forgot-answers.dto';

@Controller('auth/forgot-password')
export class ForgotPasswordController {
  constructor(private readonly forgotPasswordService: ForgotPasswordService) {}

  // ------------------- FETCH SECURITY QUESTIONS -------------------
  @Get(':username/questions')
  async fetchQuestions(
    @Param('username') username: string,
  ): Promise<ApiResponse<{ id: number; question: string }[]>> {
    const questions =
      await this.forgotPasswordService.fetchForgotQuestions(username);

    return {
      success: true,
      message: 'Security questions fetched successfully',
      data: questions,
    };
  }

  // ------------------- VERIFY ANSWERS AND RESET PASSWORD -------------------
  @Post(':username/verify')
  async verifyAnswers(
    @Param('username') username: string,
    @Body() dto: VerifyForgotAnswersDto,
  ): Promise<ApiResponse<{ newPasskey: string }>> {
    if (!dto.answers || !dto.answers.length)
      throw new BadRequestException('Answers are required');

    const result = await this.forgotPasswordService.verifyForgotAnswers(
      username,
      dto.answers,
      dto.newPassword,
    );

    return {
      success: true,
      message: result.message,
      data: { newPasskey: result.newPasskey },
    };
  }
}
