import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { Account } from './account.entity';
import { ApiResponse } from 'src/common/types/api-response.type';

@Controller('account')
@UseGuards(AuthGuard('jwt'))
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  /** CREATE */
  @Post()
  async create(
    @Body() createAccountDto: CreateAccountDto,
    @GetUser() user: User,
  ): Promise<ApiResponse<Account>> {
    try {
      const account = await this.accountService.create(createAccountDto, user);
      return {
        success: true,
        message: 'Account created successfully',
        data: account,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to create account',
        data: null,
      };
    }
  }

  /** FIND ALL (only owned by user) */
  @Get()
  async findAll(@GetUser() user: User): Promise<ApiResponse<Account[]>> {
    try {
      const accounts = await this.accountService.findAll(user.id);
      return {
        success: true,
        message: 'Accounts fetched successfully',
        data: accounts,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to fetch accounts',
        data: null,
      };
    }
  }

  /** FIND ONE */
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<Account>> {
    try {
      const account = await this.accountService.findOne(id);
      return {
        success: true,
        message: 'Account fetched successfully',
        data: account,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to fetch account',
        data: null,
      };
    }
  }

  /** UPDATE (only owner can update) */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAccountDto: UpdateAccountDto,
    @GetUser() user: User,
  ): Promise<ApiResponse<Account>> {
    try {
      const account = await this.accountService.update(
        id,
        updateAccountDto,
        user.id,
      );
      return {
        success: true,
        message: 'Account updated successfully',
        data: account,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to update account',
        data: null,
      };
    }
  }

  /** DELETE (only owner can delete) */
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<ApiResponse<null>> {
    try {
      await this.accountService.remove(id, user.id);
      return {
        success: true,
        message: 'Account deleted successfully',
        data: null,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to delete account',
        data: null,
      };
    }
  }
}
