import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
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
import { AccountsService } from './services/accounts.service';
import { AccountTypesService } from './services/account-types.service';
import { AccountUserRolesService } from './services/account-user-roles.service.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Account } from './entity/account.entity';
import { AccountType } from './entity/account-type.entity';
import { AccountUserRole } from './entity/account-user-role.entity';
import { AccountUserRoleDto } from './dto/account-user-role.dto';

@ApiTags('Finance Accounts')
@UseGuards(AuthGuard('jwt'))
@Controller('finance/accounts')
export class AccountsController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly accountTypesService: AccountTypesService,
    private readonly accountUserRolesService: AccountUserRolesService,
  ) {}

  // --------- Account CRUD ---------

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @SwaggerResponse({
    status: 201,
    description: 'Account created successfully.',
  })
  async createAccount(
    @GetUser() user: User,
    @Body() dto: CreateAccountDto,
  ): Promise<ApiResponse<Account>> {
    const account = await this.accountsService.createAccount(user, dto);
    return { success: true, message: 'Account created', data: account };
  }

  @Get('/my')
  @ApiOperation({ summary: 'List accounts for the current user' })
  @SwaggerResponse({
    status: 200,
    description: 'Accounts fetched successfully.',
  })
  async listAccounts(@GetUser() user: User): Promise<ApiResponse<Account[]>> {
    const accounts = await this.accountsService.listAccounts(user);
    return { success: true, message: 'Accounts fetched', data: accounts };
  }

  @Get('/access')
  @ApiOperation({ summary: 'List accounts for the current user with roles' })
  @SwaggerResponse({
    status: 200,
    description: 'Accounts with roles fetched successfully.',
  })
  async getUserAccountsWithRoles(
    @GetUser() user: User,
  ): Promise<ApiResponse<any[]>> {
    const roles =
      await this.accountUserRolesService.getUserAccountsWithRoles(user);
    return {
      success: true,
      message: 'Accounts with roles fetched',
      data: roles,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an account' })
  @SwaggerResponse({
    status: 200,
    description: 'Account updated successfully.',
  })
  async updateAccount(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
    @Body() dto: UpdateAccountDto,
  ): Promise<ApiResponse<Account>> {
    const account = await this.accountsService.updateAccount(id, dto, user);
    return { success: true, message: 'Account updated', data: account };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an account' })
  @SwaggerResponse({
    status: 200,
    description: 'Account deleted successfully.',
  })
  async deleteAccount(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<ApiResponse<null>> {
    await this.accountsService.deleteAccount(id, user);
    return { success: true, message: 'Account deleted', data: null };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single account' })
  @SwaggerResponse({
    status: 200,
    description: 'Account fetched successfully.',
  })
  async getAccount(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<ApiResponse<Account>> {
    const account = await this.accountsService.getAccount(id, user);
    return { success: true, message: 'Account fetched', data: account };
  }

  // --------- Account Types ---------

  @Get('/types/all')
  @ApiOperation({ summary: 'List all active account types' })
  @SwaggerResponse({
    status: 200,
    description: 'Account types fetched successfully.',
  })
  async listAccountTypes(): Promise<ApiResponse<AccountType[]>> {
    const types = await this.accountTypesService.listAccountTypes();
    return { success: true, message: 'Account types fetched', data: types };
  }

  // --------- User Roles ---------

  @Post(':id/roles')
  @ApiOperation({ summary: 'Assign a role to a user for an account' })
  @SwaggerResponse({ status: 201, description: 'Role assigned successfully.' })
  async assignRole(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) accountId: number,
    @Body() dto: AssignRoleDto,
  ): Promise<ApiResponse<AccountUserRole>> {
    const role = await this.accountUserRolesService.assignRole(
      user,
      accountId,
      dto,
    );
    return { success: true, message: 'Role assigned', data: role };
  }

  @Put(':id/roles/:userId')
  @ApiOperation({ summary: 'Update a user role for an account' })
  @SwaggerResponse({ status: 200, description: 'Role updated successfully.' })
  async updateRole(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) accountId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateRoleDto,
  ): Promise<ApiResponse<AccountUserRole>> {
    const role = await this.accountUserRolesService.updateRole(
      user,
      accountId,
      userId,
      dto,
    );
    return { success: true, message: 'Role updated', data: role };
  }

  @Delete(':id/roles/:userId')
  @ApiOperation({ summary: 'Remove a user role from an account' })
  @SwaggerResponse({ status: 200, description: 'Role removed successfully.' })
  async removeRole(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) accountId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<ApiResponse<null>> {
    await this.accountUserRolesService.removeRole(user, accountId, userId);
    return { success: true, message: 'Role removed', data: null };
  }

  @Get(':id/roles')
  @ApiOperation({ summary: 'List roles assigned to an account' })
  @SwaggerResponse({ status: 200, description: 'Roles fetched successfully.' })
  async listRoles(
    @Param('id', ParseIntPipe) accountId: number,
  ): Promise<ApiResponse<any[]>> {
    const roles = await this.accountUserRolesService.listRoles(accountId);
    return { success: true, message: 'Roles fetched', data: roles };
  }

  // --------- Ownership Transfer ---------
  @Post(':id/transfer-ownership/:newOwnerId')
  @ApiOperation({ summary: 'Transfer account ownership to another user' })
  @SwaggerResponse({
    status: 200,
    description: 'Ownership transferred successfully.',
  })
  async transferOwnership(
    @GetUser() currentOwner: User,
    @Param('id', ParseIntPipe) accountId: number,
    @Param('newOwnerId', ParseIntPipe) newOwnerId: number,
  ): Promise<ApiResponse<null>> {
    await this.accountUserRolesService.transferOwnership(
      currentOwner,
      accountId,
      newOwnerId,
    );
    return { success: true, message: 'Ownership transferred', data: null };
  }
}
