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
import { GetUser } from 'src/auth/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
} from '@nestjs/swagger';
import { User } from 'src/auth/entity/user.entity';
import { AccountUserRolesService } from '../services/account-user-roles.service';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

@ApiTags('Finance Account User Roles')
@UseGuards(AuthGuard('jwt'))
@Controller('accounts/:accountId/roles')
export class AccountUserRolesController {
  constructor(private readonly rolesService: AccountUserRolesService) {}

  @Post()
  @ApiOperation({ summary: 'Assign a role to a user in the account' })
  @SwaggerResponse({
    status: 201,
    description: 'Role assigned successfully.',
  })
  async addRole(
    @Param('accountId', ParseIntPipe) accountId: number,
    @GetUser() user: User,
    @Body() dto: AssignRoleDto,
  ) {
    return this.rolesService.addRole(user.id, accountId, dto);
  }

  @Patch(':userId')
  @ApiOperation({ summary: 'Update a user role in the account' })
  @SwaggerResponse({
    status: 200,
    description: 'Role updated successfully.',
  })
  async updateRole(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('userId', ParseIntPipe) targetUserId: number,
    @GetUser() user: User,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.rolesService.updateRole(
      user.id,
      accountId,
      targetUserId,
      dto,
      user,
    );
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Remove a user role from the account' })
  @SwaggerResponse({
    status: 200,
    description: 'Role removed successfully.',
  })
  async removeRole(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('userId', ParseIntPipe) targetUserId: number,
    @GetUser() user: User,
  ) {
    return this.rolesService.removeRole(user.id, accountId, targetUserId, user);
  }

  @Post('transfer-ownership/:newOwnerId')
  @ApiOperation({ summary: 'Transfer account ownership to another user' })
  @SwaggerResponse({
    status: 200,
    description: 'Ownership transferred successfully.',
  })
  async transferOwnership(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('newOwnerId', ParseIntPipe) newOwnerId: number,
    @GetUser() user: User,
  ) {
    return this.rolesService.transferOwnership(
      accountId,
      user.id,
      newOwnerId,
      user,
    );
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get all accounts a user has roles in' })
  @SwaggerResponse({
    status: 200,
    description: 'User accounts fetched successfully.',
  })
  async getUserAccounts(@Param('userId', ParseIntPipe) userId: number) {
    return this.rolesService.getUserAccounts(userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all roles for this account' })
  @SwaggerResponse({
    status: 200,
    description: 'Account roles fetched successfully.',
  })
  async getAccountRoles(@Param('accountId', ParseIntPipe) accountId: number) {
    return this.rolesService.getAccountRoles(accountId);
  }
}
