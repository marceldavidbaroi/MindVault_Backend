import {
  Controller,
  UseGuards,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Put,
  Delete,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { User } from 'src/auth/entity/user.entity';
import { GetUser } from 'src/auth/get-user.decorator';
import { BulkCreateTransactionDto } from '../dto/bulk-create-transaction.dto'; // make sure this exists
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { ListTransactionsFilterDto } from '../dto/list-transactions.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { TransactionService } from '../services/transaction.service';

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionsController {
  constructor(private readonly txService: TransactionService) {}

  // ----------------------
  // Single Transaction
  // ----------------------
  @Post()
  @ApiOperation({ summary: 'Create a transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@GetUser() user: User, @Body() dto: CreateTransactionDto) {
    return this.txService.createTransaction(user.id, dto);
  }

  // ----------------------
  // Bulk Transactions
  // ----------------------
  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple transactions at once' })
  @ApiResponse({ status: 201, description: 'Bulk transactions created' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createBulk(
    @GetUser() user: User,
    @Body() dto: BulkCreateTransactionDto,
  ) {
    return this.txService.createBulkTransactionsOptimized(user.id, dto);
  }

  // ----------------------
  // List Transactions
  // ----------------------
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

  // ----------------------
  // Get Single Transaction
  // ----------------------
  @Get(':id')
  @ApiOperation({ summary: 'Get a single transaction' })
  @ApiParam({ name: 'id' })
  async get(@Param('id', ParseIntPipe) id: number) {
    return this.txService.getTransaction(id);
  }

  // ----------------------
  // Update Transaction
  // ----------------------
  @Put(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  async update(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.txService.updateTransaction(user.id, id, dto);
  }

  // ----------------------
  // Delete Transaction
  // ----------------------
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a transaction' })
  @HttpCode(200)
  async remove(@GetUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.txService.deleteTransaction(user.id, id);
  }

  // ----------------------
  // Bank Statement Endpoint
  // ----------------------
  @Get(':accountId/statement')
  @ApiOperation({ summary: 'Get bank statement for an account' })
  @ApiParam({
    name: 'accountId',
    description: 'ID of the account',
    type: Number,
  })
  @ApiQuery({
    name: 'from',
    required: true,
    type: String,
    description: 'Start date YYYY-MM-DD',
  })
  @ApiQuery({
    name: 'to',
    required: true,
    type: String,
    description: 'End date YYYY-MM-DD',
  })
  async getStatement(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    // Validate from/to dates
    if (!from || !to) {
      throw new BadRequestException(
        'Both "from" and "to" query parameters are required',
      );
    }
    return this.txService.getOptimizedStatement(accountId, from, to);
  }
}
