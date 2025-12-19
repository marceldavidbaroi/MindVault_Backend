import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
} from '@nestjs/swagger';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/entity/user.entity';
import { AccountsService } from '../services/accounts.service';
import { CreateAccountDto } from '../dto/create-account.dto';
import { UpdateAccountDto } from '../dto/update-account.dto';
import { FilterAccountDto } from '../dto/filter-account.dto';
import { UpdateBalanceDto } from '../dto/update-balance.dto';

@ApiTags('Finance Accounts')
@UseGuards(AuthGuard('jwt'))
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @SwaggerResponse({
    status: 201,
    description: 'Account created successfully.',
  })
  async create(@GetUser() user: User, @Body() dto: CreateAccountDto) {
    return this.accountsService.create(user, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing account' })
  @SwaggerResponse({
    status: 200,
    description: 'Account updated successfully.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accountsService.update(id, user, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an account' })
  @SwaggerResponse({
    status: 200,
    description: 'Account deleted successfully.',
  })
  async delete(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.accountsService.delete(id, user);
  }

  @Get()
  @ApiOperation({ summary: 'List and filter accounts' })
  @SwaggerResponse({
    status: 200,
    description: 'Accounts fetched successfully.',
  })
  async list(@GetUser() user: User, @Query() filters: FilterAccountDto) {
    return this.accountsService.accountListOfCurrentUser(user.id, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single account by ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Account fetched successfully.',
  })
  async get(@Param('id', ParseIntPipe) id: number) {
    return this.accountsService.getById(id);
  }
}
