import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ForgotPasswordService } from '../services/forgot-password.service';
import type { ApiResponse as ApiResponseType } from 'src/common/types/api-response.type';
import { VerifyForgotAnswersDto } from '../dto/verify-forgot-answers.dto';

@ApiTags('Auth Forgot Password')
@Controller('auth/forgot-password')
export class ForgotPasswordController {
  constructor(private readonly forgotPasswordService: ForgotPasswordService) {}

  // ------------------- FETCH SECURITY QUESTIONS -------------------
  @Get(':username/questions')
  @ApiOperation({ summary: 'Fetch security questions for a user' })
  @ApiParam({
    name: 'username',
    type: String,
    description: 'Username to retrieve security questions for',
  })
  @ApiResponse({
    status: 200,
    description: 'Security questions fetched successfully',
    schema: {
      example: {
        success: true,
        message: 'Security questions fetched successfully',
        data: [
          { id: 1, question: "What is your mother's maiden name?" },
          { id: 2, question: 'What was your first pet’s name?' },
        ],
      },
    },
  })
  async fetchQuestions(
    @Param('username') username: string,
  ): Promise<ApiResponseType<{ id: number; question: string }[]>> {
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
  @ApiOperation({ summary: 'Verify security answers and reset password' })
  @ApiParam({
    name: 'username',
    type: String,
    description: 'Username for verification and password reset',
  })
  @ApiBody({
    type: VerifyForgotAnswersDto,
    description: 'Answers to security questions and new password',
  })
  @ApiResponse({
    status: 200,
    description: 'Answers verified and password reset successfully',
    schema: {
      example: {
        success: true,
        message: 'Password reset successfully',
        data: { newPasskey: 'generated-temp-password' },
      },
    },
  })
  async verifyAnswers(
    @Param('username') username: string,
    @Body() dto: VerifyForgotAnswersDto,
  ): Promise<ApiResponseType<{ newPasskey: string }>> {
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
