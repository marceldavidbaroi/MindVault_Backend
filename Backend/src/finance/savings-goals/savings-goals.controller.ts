import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SavingsGoalsService } from './savings-goals.service';
import { CreateSavingsGoalDto } from './dto/create-savings-goals.dto';
import { UpdateSavingsGoalDto } from './dto/update-savings-goals.dto';
import { FindSavingsGoalsDto } from './dto/find-savings-goal.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { SavingsGoals } from './savings-goals.entity';
import { ApiResponse } from 'src/common/types/api-response.type';

@Controller('savings-goals')
@UseGuards(AuthGuard('jwt'))
export class SavingsGoalsController {
  constructor(private readonly savingsGoalsService: SavingsGoalsService) {}

  /** List all savings goals */
  // @Get()
  // async findAll(
  //   @GetUser() user: User,
  //   @Query() filters: FindSavingsGoalsDto,
  // ): Promise<ApiResponse<SavingsGoals[]>> {
  //   const { data, total, page, limit } = await this.savingsGoalsService.findAll(
  //     user,
  //     filters,
  //   );
  //   return {
  //     success: true,
  //     message: 'Savings goals fetched successfully',
  //     data,
  //     meta: { total, page, limit },
  //   };
  // }

  // /** Get details of a single savings goal */
  // @Get(':id')
  // async findOne(
  //   @Param('id', ParseIntPipe) id: number,
  //   @GetUser() user: User,
  // ): Promise<ApiResponse<SavingsGoals>> {
  //   const goal = await this.savingsGoalsService.findOne(id, user);
  //   return {
  //     success: true,
  //     message: 'Savings goal fetched successfully',
  //     data: goal,
  //   };
  // }

  // /** Create a new savings goal */
  // @Post()
  // async create(
  //   @Body() createDto: CreateSavingsGoalDto,
  //   @GetUser() user: User,
  // ): Promise<ApiResponse<SavingsGoals>> {
  //   const goal = await this.savingsGoalsService.create(createDto, user);
  //   return {
  //     success: true,
  //     message: 'Savings goal created successfully',
  //     data: goal,
  //   };
  // }

  // /** Update a savings goal */
  // @Put(':id')
  // async update(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() updateDto: UpdateSavingsGoalDto,
  //   @GetUser() user: User,
  // ): Promise<ApiResponse<SavingsGoals>> {
  //   const goal = await this.savingsGoalsService.update(id, updateDto, user);
  //   return {
  //     success: true,
  //     message: 'Savings goal updated successfully',
  //     data: goal,
  //   };
  // }

  // /** Delete a savings goal */
  // @Delete(':id')
  // async remove(
  //   @Param('id', ParseIntPipe) id: number,
  //   @GetUser() user: User,
  // ): Promise<ApiResponse<null>> {
  //   await this.savingsGoalsService.remove(id, user);
  //   return {
  //     success: true,
  //     message: 'Savings goal deleted successfully',
  //     data: null,
  //   };
  // }

  // /** Add amount to current savings and create a transaction */
  // @Patch(':id/add')
  // async addToSavings(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body('amount') amount: number,
  //   @GetUser() user: User,
  // ): Promise<ApiResponse<SavingsGoals>> {
  //   if (amount <= 0) {
  //     return {
  //       success: false,
  //       message: 'Amount must be greater than 0',
  //       data: undefined,
  //     };
  //   }
  //   const goal = await this.savingsGoalsService.addToSavings(id, amount, user);
  //   return {
  //     success: true,
  //     message: 'Amount added to savings successfully',
  //     data: goal,
  //   };
  // }

  // /** Edit a specific savings transaction */
  // @Patch(':goalId/edit/:transactionId')
  // async editSavingsAmount(
  //   @Param('goalId', ParseIntPipe) goalId: number,
  //   @Param('transactionId', ParseIntPipe) transactionId: number,
  //   @Body('amount') amount: number,
  //   @GetUser() user: User,
  // ): Promise<ApiResponse<SavingsGoals>> {
  //   if (amount < 0) {
  //     return {
  //       success: false,
  //       message: 'Amount must be 0 or greater',
  //       data: undefined,
  //     };
  //   }

  //   const goal = await this.savingsGoalsService.editSavingsTransaction(
  //     goalId,
  //     transactionId,
  //     amount,
  //     user,
  //   );

  //   return {
  //     success: true,
  //     message: 'Saved amount updated successfully',
  //     data: goal,
  //   };
  // }

  // /** Remove a specific savings transaction */
  // @Patch(':goalId/remove/:transactionId')
  // async removeSavings(
  //   @Param('goalId', ParseIntPipe) goalId: number,
  //   @Param('transactionId', ParseIntPipe) transactionId: number,
  //   @GetUser() user: User,
  // ): Promise<ApiResponse<SavingsGoals>> {
  //   const goal = await this.savingsGoalsService.removeSavingsTransaction(
  //     goalId,
  //     transactionId,
  //     user,
  //   );

  //   return {
  //     success: true,
  //     message: 'Saved amount removed successfully',
  //     data: goal,
  //   };
  // }
}
