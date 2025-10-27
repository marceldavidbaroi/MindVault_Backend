import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AccountTypesService } from './account_types.service';
import { CreateAccountTypeDto } from './dto/create-account-type.dto';
import { UpdateAccountTypeDto } from './dto/update-account-type.dto';
import { FilterAccountTypeDto } from './dto/filter-account-type.dto';
import { ApiResponse } from 'src/common/types/api-response.type';
import { AccountType } from './account_types.entity';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';

@Controller('account-types')
@UseGuards(AuthGuard('jwt'))
export class AccountTypesController {
  constructor(private readonly accountTypesService: AccountTypesService) {}

  /** CREATE */
  @Post()
  async create(
    @Body() createAccountTypeDto: CreateAccountTypeDto,
    @GetUser() user: User,
  ): Promise<ApiResponse<AccountType>> {
    const accountType = await this.accountTypesService.create(
      createAccountTypeDto,
      user,
    );

    return {
      success: true,
      message: 'Account type created successfully',
      data: accountType,
    };
  }

  /** GET ALL (with filters + pagination) */
  @Get()
  async findAll(
    @Query() query: FilterAccountTypeDto,
    @GetUser() user: User,
  ): Promise<ApiResponse<AccountType[]>> {
    const data = await this.accountTypesService.findAll(user, query);

    return {
      success: true,
      message: 'Account types fetched successfully',
      data: data,
    };
  }

  /** GET ONE */
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<ApiResponse<AccountType>> {
    const accountType = await this.accountTypesService.findOne(id, user);
    return {
      success: true,
      message: 'Account type fetched successfully',
      data: accountType,
    };
  }

  /** UPDATE */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAccountTypeDto: UpdateAccountTypeDto,
    @GetUser() user: User,
  ): Promise<ApiResponse<AccountType>> {
    const accountType = await this.accountTypesService.update(
      id,
      updateAccountTypeDto,
      user,
    );
    return {
      success: true,
      message: 'Account type updated successfully',
      data: accountType,
    };
  }

  /** DELETE */
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<ApiResponse<null>> {
    await this.accountTypesService.remove(id, user);
    return {
      success: true,
      message: 'Account type deleted successfully',
      data: null,
    };
  }
}
