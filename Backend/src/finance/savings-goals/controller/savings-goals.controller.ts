import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { ApiResponse } from 'src/common/types/api-response.type';
import { SavingsGoalsService } from '../service/savings-goals.service';
import { CreateSavingsGoalDto } from '../dto/savings-goal-creation.dto';
import { UpdateSavingsGoalDto } from '../dto/savings-goal-update.dto';
import { SavingsGoal } from '../entity/savings-goals.entity';

@ApiTags('Finance Savings Goals')
@UseGuards(AuthGuard('jwt'))
@Controller('finance/savings-goals')
export class SavingsGoalsController {
  constructor(private readonly savingsGoalsService: SavingsGoalsService) {}

  /** CREATE */
  @Post()
  @ApiOperation({ summary: 'Create a new savings goal and dedicated account' })
  @SwaggerResponse({
    status: 201,
    description: 'Savings goal created successfully.',
  })
  async createGoal(
    @GetUser() user: User,
    @Body() dto: CreateSavingsGoalDto,
  ): Promise<ApiResponse<SavingsGoal>> {
    const goal = await this.savingsGoalsService.createGoal(user, dto);
    return {
      success: true,
      message: 'Savings goal created',
      data: goal,
    };
  }

  /** LIST MY GOALS */
  @Get('/my')
  @ApiOperation({
    summary: 'List all savings goals the current user is associated with',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Savings goals fetched successfully.',
  })
  async listUserGoals(
    @GetUser() user: User,
  ): Promise<ApiResponse<SavingsGoal[]>> {
    const goals = await this.savingsGoalsService.listUserGoals(user);
    return {
      success: true,
      message: 'User savings goals fetched',
      data: goals,
    };
  }

  /** GET SINGLE GOAL + PROGRESS */
  @Get(':id')
  @ApiOperation({ summary: 'Get a savings goal details and current progress' })
  @SwaggerResponse({
    status: 200,
    description: 'Savings goal fetched successfully.',
  })
  async getGoal(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<{ goal: SavingsGoal; progress: string }>> {
    const result = await this.savingsGoalsService.getGoalProgress(id);
    return {
      success: true,
      message: 'Savings goal fetched',
      data: result,
    };
  }

  /** UPDATE GOAL */
  @Put(':id')
  @ApiOperation({ summary: 'Update a savings goal' })
  @SwaggerResponse({
    status: 200,
    description: 'Savings goal updated successfully.',
  })
  async updateGoal(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSavingsGoalDto,
  ): Promise<ApiResponse<SavingsGoal>> {
    const updated = await this.savingsGoalsService.updateGoal(user, id, dto);
    return {
      success: true,
      message: 'Savings goal updated',
      data: updated,
    };
  }

  /** DELETE GOAL */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a savings goal' })
  @SwaggerResponse({
    status: 200,
    description: 'Savings goal deleted successfully.',
  })
  async deleteGoal(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<null>> {
    await this.savingsGoalsService.deleteGoal(user, id);
    return {
      success: true,
      message: 'Savings goal deleted',
      data: null,
    };
  }
}
