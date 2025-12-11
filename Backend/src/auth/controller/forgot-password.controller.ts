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
  })
  async fetchQuestions(
    @Param('username') username: string,
  ): Promise<ApiResponseType<any>> {
    return this.forgotPasswordService.fetchForgotQuestions(username);
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
  })
  async verifyAnswers(
    @Param('username') username: string,
    @Body() dto: VerifyForgotAnswersDto,
  ): Promise<ApiResponseType<any>> {
    if (!dto.answers?.length)
      throw new BadRequestException('Answers are required');

    return this.forgotPasswordService.verifyForgotAnswers(
      username,
      dto.answers,
      dto.newPassword,
    );
  }
}
