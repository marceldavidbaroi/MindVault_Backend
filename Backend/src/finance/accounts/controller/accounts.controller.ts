import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AccountsService } from '../services/accounts.service';
import { CreateAccountDto } from '../dto/create-account.dto';
import { UpdateAccountDto } from '../dto/update-account.dto';
import { FilterAccountDto } from '../dto/filter-account.dto';
import { UpdateBalanceDto } from '../dto/update-balance.dto';
import { User } from 'src/auth/entity/user.entity';
import { GetUser } from 'src/auth/get-user.decorator';

@ApiTags('Accounts')
@Controller('finance/accounts')
export class AccountsController {
  constructor(private readonly service: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  async create(@GetUser() user: User, @Body() dto: CreateAccountDto) {
    return this.service.create(user, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update account info (admin/owner)' })
  async update(
     @GetUser() user: User
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.service.update(id,user, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete account (owner only)' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @Get()
  @ApiOperation({
    summary: 'List accounts with filters, pagination, relations',
  })
  async list(@Query() filter: FilterAccountDto) {
    return this.service.list(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID with optional relations' })
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @Query('relations') relations: string,
  ) {
    const rels = relations ? relations.split(',') : [];
    return this.service.getById(id, rels);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get current balance' })
  async getBalance(@Param('id', ParseIntPipe) id: number) {
    return this.service.getBalance(account);
  }

  @Put(':id/balance')
  @ApiOperation({ summary: 'Update balance (add/subtract/set)' })
  async updateBalance(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBalanceDto,
  ) {
    return this.service.updateBalance(account, dto);
  }
}
