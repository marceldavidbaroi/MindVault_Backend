import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TransactionService } from '../services/transaction.service';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { ListTransactionsFilterDto } from '../dto/list-transactions.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionsController {
  constructor(private readonly txService: TransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@GetUser() user: User, @Body() dto: CreateTransactionDto) {
    return this.txService.createTransaction(user.id, dto);
  }

  @Get(':accountId/transactions')
  @ApiOperation({ summary: 'List transactions for an account' })
  @ApiParam({
    name: 'accountId',
    description: 'ID of the account',
    type: Number,
  })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ['income', 'expense'] })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'cleared', 'void', 'failed'],
  })
  @ApiQuery({ name: 'creatorUserId', required: false, type: Number })
  @ApiQuery({
    name: 'from',
    required: false,
    type: String,
    description: 'Start date YYYY-MM-DD',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    type: String,
    description: 'End date YYYY-MM-DD',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })

  // ⭐ NEW: Sorting
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: [
      'transactionDate',
      'createdAt',
      'updatedAt',
      'amount',
      'type',
      'status',
    ],
    description: 'Column to sort by (default: transactionDate)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort direction (default: DESC)',
  })
  async listTransactions(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query() filters: ListTransactionsFilterDto,
  ) {
    return this.txService.listTransactions(accountId, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single transaction' })
  @ApiParam({ name: 'id' })
  async get(@Param('id', ParseIntPipe) id: number) {
    return this.txService.getTransaction(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.txService.updateTransaction(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a transaction' })
  @HttpCode(200)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.txService.deleteTransaction(id);
  }
}
