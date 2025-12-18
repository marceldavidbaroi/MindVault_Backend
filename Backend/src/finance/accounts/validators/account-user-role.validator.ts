import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountUserRoleRepository } from '../repository/account-user-role.repository';

@Injectable()
export class AccountUserRoleValidator {
  constructor(private readonly repo: AccountUserRoleRepository) {}

  async ensureExists(accountId: number, userId: number) {
    const role = await this.repo.findOneByAccountAndUser(accountId, userId);
    if (!role) {
      throw new NotFoundException('Role not found for this user');
    }
    return role;
  }

  ensureCanManage(actorRoleId: number, targetRoleId: number) {
    if (actorRoleId > targetRoleId) {
      throw new ForbiddenException('Insufficient permission');
    }
  }

  async assignRoleValidator(
    actorRoleId: number,
    accountId: number,
    targetUserId: number,
    roleId: number,
  ): Promise<void> {
    // Owner must be assigned via ownership transfer
    if (roleId === 1) {
      throw new BadRequestException('Owner must be assigned separately');
    }

    // Only Owner or Admin can assign roles
    if (![1, 2].includes(actorRoleId)) {
      throw new ForbiddenException('Insufficient permission');
    }

    // Admin cannot assign Owner or Admin
    if (actorRoleId === 2 && roleId < 3) {
      throw new ForbiddenException('Admin cannot assign Owner or Admin role');
    }

    // Prevent duplicate role assignment
    const existing = await this.repo.findOneByAccountAndUser(
      accountId,
      targetUserId,
    );

    if (existing) {
      throw new BadRequestException('User already has a role in this account');
    }
  }

  async updateRoleValidator(
    actorRoleId: number,
    accountId: number,
    targetUserId: number,
    newRoleId: number,
  ) {
    // Only Owner or Admin can update roles
    if (![1, 2].includes(actorRoleId)) {
      throw new ForbiddenException(
        'You do not have permission to update roles',
      );
    }

    // Cannot assign Owner via this method
    if (newRoleId === 1) {
      throw new BadRequestException('Use transfer ownership to assign Owner');
    }

    const targetRole = await this.ensureExists(accountId, targetUserId);

    // Ensure actor cannot manage higher hierarchy
    this.ensureCanManage(actorRoleId, targetRole.roleId);

    // Admin (2) cannot assign Owner or Admin
    if (actorRoleId === 2 && newRoleId < 3) {
      throw new ForbiddenException('Admin cannot assign Owner or Admin role');
    }

    return targetRole;
  }

  async validateRemoveRole(
    accountId: number,
    actorUserId: number,
    targetUserId: number,
  ) {
    const actorRole = await this.ensureExists(accountId, actorUserId);
    const targetRole = await this.ensureExists(accountId, targetUserId);

    const actorRoleId = actorRole.roleId;
    const targetRoleId = targetRole.roleId;

    // Owner cannot delete themselves
    if (actorRoleId === 1 && actorUserId === targetUserId) {
      throw new BadRequestException('Owner cannot delete their own role');
    }

    // Owner can delete anyone else
    if (actorRoleId === 1) {
      return targetRole;
    }

    // Admin rules
    if (actorRoleId === 2) {
      // Admin can delete self
      if (actorUserId === targetUserId) return targetRole;

      // Admin can delete editor or viewer only
      if (targetRoleId > 2) return targetRole;

      throw new ForbiddenException(
        'Admin can only delete themselves or editor/viewer roles',
      );
    }

    // Editor or Viewer rules
    if (actorRoleId > 2) {
      // Can only delete self
      if (actorUserId === targetUserId) return targetRole;
      throw new ForbiddenException(
        'Editors and viewers can only remove their own roles',
      );
    }

    throw new ForbiddenException('Insufficient permissions');
  }

  async validateTransferOwnership(
    accountId: number,
    currentOwnerId: number,
    newOwnerId: number,
  ) {
    // Ensure current owner exists
    const currentOwner = await this.ensureExists(accountId, currentOwnerId);
    if (currentOwner.roleId !== 1) {
      throw new ForbiddenException('Only current owner can transfer ownership');
    }

    // Prevent transferring ownership to self
    if (currentOwnerId === newOwnerId) {
      throw new BadRequestException('Cannot transfer ownership to self');
    }

    // Check if new owner exists in account
    const newOwner = await this.repo.findOneByAccountAndUser(
      accountId,
      newOwnerId,
    );

    // Return both entities for the service to use
    return { currentOwner, newOwner };
  }

  ensureOwner(ownerId: number, userId: number) {
    if (ownerId !== userId) {
      throw new ForbiddenException('User is not the owner of this account');
    }
  }
  async ensureOwnerOrAdmin(accountId: number, userId: number) {
    const role = await this.ensureExists(accountId, userId);

    if (![1, 2].includes(role.roleId)) {
      throw new ForbiddenException(
        'Only owner or admin is allowed to perform this action',
      );
    }

    return role;
  }

  async ensureOwnerAdminOrEditor(accountId: number, userId: number) {
    const role = await this.ensureExists(accountId, userId);

    if (![1, 2, 3].includes(role.roleId)) {
      throw new ForbiddenException(
        'Only owner, admin, or editor is allowed to perform this action',
      );
    }

    return role;
  }
}
