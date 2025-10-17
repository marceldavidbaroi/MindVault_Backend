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
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FindTransactionsDto } from './dto/find-transaction.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { Transactions } from './transactions.entity';
import { ApiResponse } from 'src/common/types/api-response.type';
import { BulkTransactionDto } from './dto/bulk-transaction.dto';

@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /** CREATE */
  @Post()
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @GetUser() user: User,
  ): Promise<ApiResponse<Transactions>> {
    const transaction = await this.transactionsService.create(
      createTransactionDto,
      user,
    );
    return {
      success: true,
      message: 'Transaction created successfully',
      data: transaction,
    };
  }

  /** Bulk create transactions */
  @Post('bulk')
  async createBulk(
    @GetUser() user: User,
    @Body() bulkTransactionDto: BulkTransactionDto,
  ) {
    const { date, type, transactions } = bulkTransactionDto;

    const createdTransactions = await this.transactionsService.createBulk(
      user,
      type,
      date,
      transactions,
    );

    return {
      success: true,
      message: `${createdTransactions.length} transactions created successfully`,
      data: createdTransactions,
    };
  }

  /** GET ALL WITH FILTERS + PAGINATION */
  @Get()
  async findAll(
    @Query() query: FindTransactionsDto,
    @GetUser() user: User,
  ): Promise<ApiResponse<Transactions[]>> {
    const { data, total, page, limit } = await this.transactionsService.findAll(
      user,
      query,
    );

    return {
      success: true,
      message: 'Transactions fetched successfully',
      data, // the actual array of transactions
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  /** GET ONE */
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<ApiResponse<Transactions>> {
    const transaction = await this.transactionsService.findOne(id, user);
    return {
      success: true,
      message: 'Transaction fetched successfully',
      data: transaction,
    };
  }

  /** UPDATE */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @GetUser() user: User,
  ): Promise<ApiResponse<Transactions>> {
    const transaction = await this.transactionsService.update(
      id,
      updateTransactionDto,
      user,
    );
    return {
      success: true,
      message: 'Transaction updated successfully',
      data: transaction,
    };
  }

  /** DELETE */
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<ApiResponse<null>> {
    await this.transactionsService.remove(id, user);
    return {
      success: true,
      message: 'Transaction deleted successfully',
      data: null,
    };
  }
}
