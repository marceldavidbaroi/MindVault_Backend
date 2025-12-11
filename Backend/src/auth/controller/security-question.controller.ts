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
import { User } from '../entity/user.entity';
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
  })
  async getSecurityQuestions(
    @GetUser() user: User,
  ): Promise<ApiResponseType<any[]>> {
    return await this.service.getSecurityQuestions(user.id);
  }

  // ------------------- CREATE -------------------
  @Post()
  @ApiOperation({ summary: 'Create a new security question for the user' })
  @ApiBody({ type: CreateSecurityQuestionDto })
  @ApiResponse({
    status: 201,
    description: 'Security question created successfully',
  })
  async createSecurityQuestion(
    @GetUser() user: User,
    @Body() body: CreateSecurityQuestionDto,
  ): Promise<ApiResponseType<any>> {
    return await this.service.createSecurityQuestion(
      user.id,
      body.question,
      body.answer,
      body.password,
    );
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
  })
  async updateSecurityQuestion(
    @GetUser() user: User,
    @Param('id') id: number,
    @Body() body: CreateSecurityQuestionDto,
  ): Promise<ApiResponseType<any>> {
    return await this.service.updateSecurityQuestion(
      user.id,
      id,
      body.question,
      body.answer,
      body.password,
    );
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
  })
  async deleteSecurityQuestion(
    @GetUser() user: User,
    @Param('id') id: number,
    @Body() dto: DeleteSecurityQuestionDto,
  ): Promise<ApiResponseType<null>> {
    return await this.service.deleteSecurityQuestion(user.id, id, dto.password);
  }
}
