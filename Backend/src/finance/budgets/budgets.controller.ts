import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Query,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { FindBudgetsDto } from './dto/find-budget.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { Budgets } from './budgets.entity';
import { ApiResponse } from 'src/common/types/api-response.type';
import { BudgetAlertsDto } from './dto/budget-alert.dto';

@Controller('budgets')
@UseGuards(AuthGuard('jwt'))
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  // /** CREATE */
  // @Post()
  // async create(
  //   @Body() createBudgetDto: CreateBudgetDto,
  //   @GetUser() user: User,
  // ): Promise<ApiResponse<Budgets>> {
  //   const budget = await this.budgetsService.create(createBudgetDto, user);
  //   return {
  //     success: true,
  //     message: 'Budget created successfully',
  //     data: budget,
  //   };
  // }

  // /** GET ALL WITH FILTERS + PAGINATION */
  // @Get()
  // async findAll(
  //   @Query() query: FindBudgetsDto,
  //   @GetUser() user: User,
  // ): Promise<ApiResponse<Budgets[]>> {
  //   const { data, total, page, limit } = await this.budgetsService.findAll(
  //     user,
  //     query,
  //   );

  //   return {
  //     success: true,
  //     message: 'Budgets fetched successfully',
  //     data,
  //     meta: {
  //       total,
  //       page,
  //       limit,
  //     },
  //   };
  // }

  // /** GET BUDGET ALERTS */
  // @Get('alerts')
  // async getAlerts(@Query() query: BudgetAlertsDto, @GetUser() user: User) {
  //   // Parse numeric strings into actual numbers
  //   const threshold = query.threshold ? parseFloat(query.threshold) : 0.9;
  //   const month = query.month ? parseInt(query.month) : undefined;
  //   const year = query.year ? parseInt(query.year) : undefined;

  //   console.log({ threshold, month, year });

  //   const alerts = await this.budgetsService.getBudgetAlerts(
  //     user,
  //     threshold,
  //     month,
  //     year,
  //   );

  //   return {
  //     success: true,
  //     message: 'Budget alerts fetched successfully',
  //     data: alerts,
  //   };
  // }

  // /** GET ONE */
  // @Get(':id')
  // async findOne(
  //   @Param('id', ParseIntPipe) id: number,
  //   @GetUser() user: User,
  // ): Promise<ApiResponse<Budgets>> {
  //   const budget = await this.budgetsService.findOne(id, user);
  //   return {
  //     success: true,
  //     message: 'Budget fetched successfully',
  //     data: budget,
  //   };
  // }

  // /** UPDATE */
  // @Patch(':id')
  // async update(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() updateBudgetDto: UpdateBudgetDto,
  //   @GetUser() user: User,
  // ): Promise<ApiResponse<Budgets>> {
  //   const budget = await this.budgetsService.update(id, updateBudgetDto, user);
  //   return {
  //     success: true,
  //     message: 'Budget updated successfully',
  //     data: budget,
  //   };
  // }

  // /** DELETE */
  // @Delete(':id')
  // async remove(
  //   @Param('id') id: number,
  //   @GetUser() user: User,
  // ): Promise<ApiResponse<null>> {
  //   await this.budgetsService.remove(id, user);
  //   return {
  //     success: true,
  //     message: 'Budget deleted successfully',
  //     data: null,
  //   };
  // }

  // @Get('alerts')
  // async getAlerts(@Query() query: BudgetAlertsDto, @GetUser() user: User) {
  //   console.log('Query received:', query); // check types
  //   return query;
  // }
}
