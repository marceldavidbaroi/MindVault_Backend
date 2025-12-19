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

@Injectable()
export class AccountUserRolesService {
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
    return manager.getRepository(AccountUserRole).save({
      accountId,
      userId: user.id,
      roleId: 1, // OWNER
    });
  }

  /** Assign role with transaction and log */
  async addRole(currentUserId: number, accountId: number, dto: AssignRoleDto) {
    await this.accountValidator.ensureExists(accountId);
    await this.userValidator.ensureUserExists(dto.userId);
    await this.rolesValidator.ensureExists(dto.roleId);
    await this.accountUserRoleValidator.assignRoleValidator(
      currentUserId,
      accountId,
      dto.userId,
      dto.roleId,
    );

    return this.repo.manager.transaction(async (manager) => {
      const newRole = await manager.getRepository(AccountUserRole).save({
        accountId,
        userId: dto.userId,
        roleId: dto.roleId,
      });

      // Log the addition
      await this.accountLogService.create(manager, {
        accountId,
        userId: currentUserId,
        action: 'ADD_ROLE',
        oldValue: null,
        newValue: { userId: dto.userId, roleId: dto.roleId },
      });

      return newRole;
    });
  }

  /** Update role with transaction and log */
  async updateRole(
    currentUserId: number,
    accountId: number,
    userId: number,
    dto: UpdateRoleDto,
    user: User,
  ) {
    // 1️⃣ Validate account, user, role
    await this.accountValidator.ensureExists(accountId);
    await this.userValidator.ensureUserExists(userId);
    await this.rolesValidator.ensureExists(dto.roleId);

    // 2️⃣ Get the target role
    const targetRole = await this.accountUserRoleValidator.updateRoleValidator(
      currentUserId,
      accountId,
      userId,
      dto.roleId,
    );

    return this.repo.manager.transaction(async (manager) => {
      const oldRole = { userId: targetRole.userId, roleId: targetRole.roleId };

      // 3️⃣ Check if role actually changes
      if (oldRole.roleId === dto.roleId) {
        // Nothing changed, optionally log attempt
        await this.accountLogService.create(manager, {
          accountId,
          userId: user.id,
          action: 'UPDATE_ROLE_ATTEMPT_NO_CHANGE',
          oldValue: oldRole,
          newValue: oldRole,
        });

        return targetRole; // Return the original role
      }

      // 4️⃣ Update and save
      targetRole.roleId = dto.roleId;
      const updatedRole = await manager
        .getRepository(AccountUserRole)
        .save(targetRole);

      // 5️⃣ Log the update
      await this.accountLogService.create(manager, {
        accountId,
        userId: user.id,
        action: 'UPDATE_ROLE',
        oldValue: oldRole,
        newValue: { userId: updatedRole.userId, roleId: updatedRole.roleId },
      });

      return updatedRole;
    });
  }

  /** Remove role with transaction and log */
  async removeRole(
    actorUserId: number,
    accountId: number,
    targetUserId: number,
    user: User,
  ) {
    await this.accountValidator.ensureExists(accountId);
    await this.userValidator.ensureUserExists(targetUserId);

    const target = await this.accountUserRoleValidator.validateRemoveRole(
      accountId,
      actorUserId,
      targetUserId,
    );

    return this.repo.manager.transaction(async (manager) => {
      const oldRole = { userId: target.userId, roleId: target.roleId };

      await manager.getRepository(AccountUserRole).remove(target);

      await this.accountLogService.create(manager, {
        accountId,
        userId: user.id,
        action: 'REMOVE_ROLE',
        oldValue: oldRole,
        newValue: null,
      });
    });
  }

  /** Transfer ownership with transaction and log */
  async transferOwnership(
    accountId: number,
    currentOwnerId: number,
    newOwnerId: number,
    user: User,
  ) {
    const { currentOwner, newOwner } =
      await this.accountUserRoleValidator.validateTransferOwnership(
        accountId,
        currentOwnerId,
        newOwnerId,
      );

    return this.repo.manager.transaction(async (manager) => {
      // Demote current owner
      const oldCurrentOwnerRole = {
        userId: currentOwner.userId,
        roleId: currentOwner.roleId,
      };
      currentOwner.roleId = 2; // Demote
      await manager.getRepository(AccountUserRole).save(currentOwner);

      await this.accountLogService.create(manager, {
        accountId,
        userId: user.id,
        action: 'TRANSFER_OWNERSHIP_DEMOTE',
        oldValue: oldCurrentOwnerRole,
        newValue: { userId: currentOwner.userId, roleId: currentOwner.roleId },
      });

      if (newOwner) {
        // Promote new owner
        await this.accountsService.changeOwner(accountId, newOwnerId);
        const oldNewOwnerRole = {
          userId: newOwner.userId,
          roleId: newOwner.roleId,
        };
        newOwner.roleId = 1;
        await manager.getRepository(AccountUserRole).save(newOwner);

        await this.accountLogService.create(manager, {
          accountId,
          userId: user.id,
          action: 'TRANSFER_OWNERSHIP_PROMOTE',
          oldValue: oldNewOwnerRole,
          newValue: { userId: newOwner.userId, roleId: newOwner.roleId },
        });
      } else {
        // Create owner role if it didn't exist
        await manager.getRepository(AccountUserRole).save({
          accountId,
          userId: newOwnerId,
          roleId: 1,
        });

        await this.accountLogService.create(manager, {
          accountId,
          userId: user.id,
          action: 'TRANSFER_OWNERSHIP_CREATE',
          oldValue: null,
          newValue: { userId: newOwnerId, roleId: 1 },
        });
      }
    });
  }

  /** All accounts user has roles */
  async getUserAccounts(userId: number, roleId?: number) {
    await this.userValidator.ensureUserExists(userId);
    if (roleId) {
      await this.rolesValidator.ensureExists(roleId);
    }
    const roles = await this.repo.findByUser(userId, roleId);
    return AccountUserRoleTransformer.toResponseList(roles);
  }

  /** All roles for account */
  async getAccountRoles(accountId: number) {
    await this.accountValidator.ensureExists(accountId);
    const roles = await this.repo.findByAccount(accountId);
    return AccountUserRoleTransformer.toResponseList(roles);
  }
}
