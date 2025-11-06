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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { SecurityQuestionService } from '../services/security-question.service';
import { GetUser } from '../get-user.decorator';
import { User } from '../entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import type { ApiResponse as ApiResponseType } from 'src/common/types/api-response.type';
import { CreateSecurityQuestionDto } from '../dto/create-security-question.dto';
import { DeleteSecurityQuestionDto } from '../dto/delete-security-question.dto';

@ApiTags('Auth Security Questions')
@ApiBearerAuth()
@Controller('security-questions')
@UseGuards(AuthGuard('jwt'))
export class SecurityQuestionController {
  constructor(private readonly service: SecurityQuestionService) {}

  // ------------------- GET ALL -------------------
  @Get()
  @ApiOperation({
    summary: 'Fetch all security questions for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Security questions fetched successfully',
    schema: {
      example: {
        success: true,
        message: 'Security questions fetched successfully',
        data: [
          { id: 1, question: 'What is your mother’s maiden name?' },
          { id: 2, question: 'What city were you born in?' },
        ],
      },
    },
  })
  async getSecurityQuestions(
    @GetUser() user: User,
  ): Promise<ApiResponseType<any[]>> {
    const questions = await this.service.getSecurityQuestions(user.id);
    return {
      success: true,
      message: 'Security questions fetched successfully',
      data: questions,
    };
  }

  // ------------------- CREATE -------------------
  @Post()
  @ApiOperation({ summary: 'Create a new security question for the user' })
  @ApiBody({ type: CreateSecurityQuestionDto })
  @ApiResponse({
    status: 201,
    description: 'Security question created successfully',
    schema: {
      example: {
        success: true,
        message: 'Security question created successfully',
        data: {
          id: 3,
          question: 'What is the name of your first pet?',
        },
      },
    },
  })
  async createSecurityQuestion(
    @GetUser() user: User,
    @Body() body: CreateSecurityQuestionDto,
  ): Promise<ApiResponseType<any>> {
    const question = await this.service.createSecurityQuestion(
      user.id,
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
  @ApiOperation({ summary: 'Update an existing security question by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the security question',
  })
  @ApiBody({ type: CreateSecurityQuestionDto })
  @ApiResponse({
    status: 200,
    description: 'Security question updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Security question updated successfully',
        data: {
          id: 1,
          question: 'What was the model of your first car?',
        },
      },
    },
  })
  async updateSecurityQuestion(
    @GetUser() user: User,
    @Param('id') id: number,
    @Body() body: CreateSecurityQuestionDto,
  ): Promise<ApiResponseType<any>> {
    const updated = await this.service.updateSecurityQuestion(
      user.id,
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
  @ApiOperation({ summary: 'Delete a security question by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the security question',
  })
  @ApiBody({ type: DeleteSecurityQuestionDto })
  @ApiResponse({
    status: 200,
    description: 'Security question deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Security question deleted successfully',
        data: null,
      },
    },
  })
  async deleteSecurityQuestion(
    @GetUser() user: User,
    @Param('id') id: number,
    @Body() dto: DeleteSecurityQuestionDto,
  ): Promise<ApiResponseType<null>> {
    await this.service.deleteSecurityQuestion(user.id, id, dto.password);
    return {
      success: true,
      message: 'Security question deleted successfully',
      data: null,
    };
  }
}
