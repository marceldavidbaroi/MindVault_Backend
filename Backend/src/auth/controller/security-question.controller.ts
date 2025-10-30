import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SecurityQuestionService } from '../services/security-question.service';
import { GetUser } from '../get-user.decorator';
import { User } from '../entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import type { ApiResponse } from 'src/common/types/api-response.type';
import { CreateSecurityQuestionDto } from '../dto/create-security-question.dto';
import { DeleteSecurityQuestionDto } from '../dto/delete-security-question.dto';

@Controller('security-questions')
@UseGuards(AuthGuard('jwt'))
export class SecurityQuestionController {
  constructor(private readonly service: SecurityQuestionService) {}

  // ------------------- GET ALL -------------------
  @Get()
  async getSecurityQuestions(
    @GetUser() user: User,
  ): Promise<ApiResponse<any[]>> {
    const questions = await this.service.getSecurityQuestions(user);
    return {
      success: true,
      message: 'Security questions fetched successfully',
      data: questions,
    };
  }

  // ------------------- CREATE -------------------
  @Post()
  async createSecurityQuestion(
    @GetUser() user: User,
    @Body() body: CreateSecurityQuestionDto,
  ): Promise<ApiResponse<any>> {
    const question = await this.service.createSecurityQuestion(
      user,
      body.question,
      body.answer,
      body.password,
    );
    return {
      success: true,
      message: 'Security question created successfully',
      data: question,
    };
  }

  // ------------------- UPDATE -------------------
  @Patch(':id')
  async updateSecurityQuestion(
    @GetUser() user: User,
    @Param('id') id: number,
    @Body() body: CreateSecurityQuestionDto,
  ): Promise<ApiResponse<any>> {
    const updated = await this.service.updateSecurityQuestion(
      user,
      id,
      body.question,
      body.answer,
      body.password,
    );
    return {
      success: true,
      message: 'Security question updated successfully',
      data: updated,
    };
  }

  // ------------------- DELETE -------------------
  @Delete(':id')
  async deleteSecurityQuestion(
    @GetUser() user: User,
    @Param('id') id: number,
    @Body() dto: DeleteSecurityQuestionDto,
  ): Promise<ApiResponse<null>> {
    await this.service.deleteSecurityQuestion(user, id, dto.password);
    return {
      success: true,
      message: 'Security question deleted successfully',
      data: null,
    };
  }
}
