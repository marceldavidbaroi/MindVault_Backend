import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AccountUserRoleRepository } from '../repository/account-user-role.repository';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { AccountUserRoleTransformer } from '../transformers/account-user-role.transformer';
import { User } from 'src/auth/entity/user.entity';
import { RolesValidator } from 'src/roles/validators/roles.validator';
import { UserValidator } from 'src/auth/validator/user.validator';
import { AccountValidator } from '../validators/account.validator';
import { AccountUserRoleValidator } from '../validators/account-user-role.validator';
import { AccountsService } from './accounts.service';
import { EntityManager } from 'typeorm';
import { AccountUserRole } from '../entity/account-user-role.entity';
import { AccountLogService } from './account-log.service';
import { ApiResponse } from 'src/common/types/api-response.type';

@Injectable()
export class AccountUserRolesService {
  private readonly SERVICE_SOURCE = 'account_user_role_service';

  constructor(
    private readonly repo: AccountUserRoleRepository,
    private readonly rolesValidator: RolesValidator,
    private readonly userValidator: UserValidator,
    private readonly accountValidator: AccountValidator,
    private readonly accountUserRoleValidator: AccountUserRoleValidator,
    @Inject(forwardRef(() => AccountsService))
    private readonly accountsService: AccountsService,
    private readonly accountLogService: AccountLogService,
  ) {}

  /** Create owner role */
  async createOwner(manager: EntityManager, accountId: number, user: User) {
    const data = await manager.getRepository(AccountUserRole).save({
      accountId,
      userId: user.id,
      roleId: 1, // OWNER
    });

    return {
      success: true,
      message: 'Owner role created successfully',
      data: AccountUserRoleTransformer.toResponse(data),
    };
  }

  /** Assign role with transaction and log */
  async addRole(
    currentUserId: number,
    accountId: number,
    dto: AssignRoleDto,
  ): Promise<ApiResponse<any>> {
    await this.accountValidator.ensureExists(accountId);
    await this.userValidator.ensureUserExists(dto.userId);
    await this.rolesValidator.ensureExists(dto.roleId);
    await this.accountUserRoleValidator.assignRoleValidator(
      currentUserId,
      accountId,
      dto.userId,
      dto.roleId,
    );

    const result = await this.repo.manager.transaction(async (manager) => {
      const newRole = await manager.getRepository(AccountUserRole).save({
        accountId,
        userId: dto.userId,
        roleId: dto.roleId,
      });

      await this.accountLogService.create(manager, {
        accountId,
        userId: currentUserId,
        action: 'ADD_ROLE',
        oldValue: null,
        newValue: { userId: dto.userId, roleId: dto.roleId },
        source: this.SERVICE_SOURCE,
      });

      return newRole;
    });

    return {
      success: true,
      message: 'Role assigned successfully',
      data: AccountUserRoleTransformer.toResponse(result),
    };
  }

  /** Update role with transaction and log */
  async updateRole(
    currentUserId: number,
    accountId: number,
    userId: number,
    dto: UpdateRoleDto,
    user: User,
  ): Promise<ApiResponse<any>> {
    await this.accountValidator.ensureExists(accountId);
    await this.userValidator.ensureUserExists(userId);
    await this.rolesValidator.ensureExists(dto.roleId);

    const targetRole = await this.accountUserRoleValidator.updateRoleValidator(
      currentUserId,
      accountId,
      userId,
      dto.roleId,
    );

    const result = await this.repo.manager.transaction(async (manager) => {
      const oldValue = { userId: targetRole.userId, roleId: targetRole.roleId };

      if (oldValue.roleId === dto.roleId) {
        await this.accountLogService.create(manager, {
          accountId,
          userId: currentUserId,
          action: 'UPDATE_ROLE_ATTEMPT_NO_CHANGE',
          oldValue,
          newValue: oldValue,
          source: this.SERVICE_SOURCE,
        });
        return targetRole;
      }

      targetRole.roleId = dto.roleId;
      const updatedRole = await manager
        .getRepository(AccountUserRole)
        .save(targetRole);

      await this.accountLogService.create(manager, {
        accountId,
        userId: currentUserId,
        action: 'UPDATE_ROLE',
        oldValue,
        newValue: { userId: updatedRole.userId, roleId: updatedRole.roleId },
        source: this.SERVICE_SOURCE,
      });

      return updatedRole;
    });

    return {
      success: true,
      message: 'Role updated successfully',
      data: AccountUserRoleTransformer.toResponse(result),
    };
  }

  /** Remove role with transaction and log */
  async removeRole(
    actorUserId: number,
    accountId: number,
    targetUserId: number,
    user: User,
  ): Promise<ApiResponse<null>> {
    await this.accountValidator.ensureExists(accountId);
    await this.userValidator.ensureUserExists(targetUserId);

    const target = await this.accountUserRoleValidator.validateRemoveRole(
      accountId,
      actorUserId,
      targetUserId,
    );

    await this.repo.manager.transaction(async (manager) => {
      const oldValue = { userId: target.userId, roleId: target.roleId };
      await manager.getRepository(AccountUserRole).remove(target);

      await this.accountLogService.create(manager, {
        accountId,
        userId: actorUserId,
        action: 'REMOVE_ROLE',
        oldValue,
        newValue: null,
        source: this.SERVICE_SOURCE,
      });
    });

    return {
      success: true,
      message: 'Role removed successfully',
      data: null,
    };
  }

  /** Transfer ownership with transaction and log */
  async transferOwnership(
    accountId: number,
    currentOwnerId: number,
    newOwnerId: number,
    user: User,
  ): Promise<ApiResponse<null>> {
    const { currentOwner, newOwner } =
      await this.accountUserRoleValidator.validateTransferOwnership(
        accountId,
        currentOwnerId,
        newOwnerId,
      );

    await this.repo.manager.transaction(async (manager) => {
      // Demote current owner
      const oldCurrentOwnerValue = {
        userId: currentOwner.userId,
        roleId: currentOwner.roleId,
      };
      currentOwner.roleId = 2; // Member/Editor
      await manager.getRepository(AccountUserRole).save(currentOwner);

      await this.accountLogService.create(manager, {
        accountId,
        userId: user.id,
        action: 'TRANSFER_OWNERSHIP_DEMOTE',
        oldValue: oldCurrentOwnerValue,
        newValue: { userId: currentOwner.userId, roleId: currentOwner.roleId },
        source: this.SERVICE_SOURCE,
      });

      if (newOwner) {
        await this.accountsService.changeOwner(accountId, newOwnerId);
        const oldNewOwnerValue = {
          userId: newOwner.userId,
          roleId: newOwner.roleId,
        };
        newOwner.roleId = 1; // Owner
        await manager.getRepository(AccountUserRole).save(newOwner);

        await this.accountLogService.create(manager, {
          accountId,
          userId: user.id,
          action: 'TRANSFER_OWNERSHIP_PROMOTE',
          oldValue: oldNewOwnerValue,
          newValue: { userId: newOwner.userId, roleId: newOwner.roleId },
          source: this.SERVICE_SOURCE,
        });
      } else {
        await manager
          .getRepository(AccountUserRole)
          .save({ accountId, userId: newOwnerId, roleId: 1 });

        await this.accountLogService.create(manager, {
          accountId,
          userId: user.id,
          action: 'TRANSFER_OWNERSHIP_CREATE',
          oldValue: null,
          newValue: { userId: newOwnerId, roleId: 1 },
          source: this.SERVICE_SOURCE,
        });
      }
    });

    return {
      success: true,
      message: 'Ownership transferred successfully',
      data: null,
    };
  }

  /** All accounts user has roles */
  async getUserAccounts(userId: number, roleId?: number) {
    await this.userValidator.ensureUserExists(userId);
    if (roleId) {
      await this.rolesValidator.ensureExists(roleId);
    }
    const roles = await this.repo.findByUser(userId, roleId);
    return AccountUserRoleTransformer.toAccountIdArray(roles);
  }

  /** All roles for account */
  async getAccountRoles(accountId: number) {
    await this.accountValidator.ensureExists(accountId);
    const roles = await this.repo.findByAccount(accountId);
    return AccountUserRoleTransformer.toResponseList(roles);
  }
}
