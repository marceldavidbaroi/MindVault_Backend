import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountUserRole } from '../entity/account-user-role.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AccountUserRoleValidator {
  constructor(
    @InjectRepository(AccountUserRole)
    private readonly repo: Repository<AccountUserRole>,
  ) {}

  // Helper to get repository (transaction-safe)
  private getRepo(manager?: EntityManager): Repository<AccountUserRole> {
    return manager ? manager.getRepository(AccountUserRole) : this.repo;
  }

  // ✅ Ensure role exists
  async ensureExists(
    accountId: number,
    userId: number,
    manager?: EntityManager,
  ) {
    const repo = this.getRepo(manager);
    const role = await repo.findOne({ where: { accountId, userId } });
    if (!role) throw new NotFoundException('Role not found for this user');
    return role;
  }

  // ✅ Check role hierarchy
  ensureCanManage(actorRoleId: number, targetRoleId: number) {
    if (actorRoleId > targetRoleId) {
      throw new ForbiddenException('Insufficient permission');
    }
  }

  // ✅ Assign role validator
  async assignRoleValidator(
    actorRoleId: number,
    accountId: number,
    targetUserId: number,
    roleId: number,
    manager?: EntityManager,
  ): Promise<void> {
    if (roleId === 1)
      throw new BadRequestException('Owner must be assigned separately');
    if (![1, 2].includes(actorRoleId))
      throw new ForbiddenException('Insufficient permission');
    if (actorRoleId === 2 && roleId < 3)
      throw new ForbiddenException('Admin cannot assign Owner or Admin role');

    const repo = this.getRepo(manager);
    const existing = await repo.findOne({
      where: { accountId, userId: targetUserId },
    });
    if (existing)
      throw new BadRequestException('User already has a role in this account');
  }

  // ✅ Update role validator
  async updateRoleValidator(
    actorRoleId: number,
    accountId: number,
    targetUserId: number,
    newRoleId: number,
    manager?: EntityManager,
  ) {
    if (![1, 2].includes(actorRoleId))
      throw new ForbiddenException(
        'You do not have permission to update roles',
      );

    if (newRoleId === 1)
      throw new BadRequestException('Use transfer ownership to assign Owner');

    // Get the target role
    const targetRole = await this.ensureExists(
      accountId,
      targetUserId,
      manager,
    );

    // Check hierarchy
    this.ensureCanManage(actorRoleId, targetRole.roleId);

    if (actorRoleId === 2 && newRoleId < 3)
      throw new ForbiddenException('Admin cannot assign Owner or Admin role');

    return targetRole;
  }

  // ✅ Validate removing a role
  async validateRemoveRole(
    accountId: number,
    actorUserId: number,
    targetUserId: number,
    manager?: EntityManager,
  ) {
    const actorRole = await this.ensureExists(accountId, actorUserId, manager);
    const targetRole = await this.ensureExists(
      accountId,
      targetUserId,
      manager,
    );

    const actorRoleId = actorRole.roleId;
    const targetRoleId = targetRole.roleId;

    if (actorRoleId === 1 && actorUserId === targetUserId)
      throw new BadRequestException('Owner cannot delete their own role');
    if (actorRoleId === 1) return targetRole;

    if (actorRoleId === 2) {
      if (actorUserId === targetUserId) return targetRole;
      if (targetRoleId > 2) return targetRole;
      throw new ForbiddenException(
        'Admin can only delete themselves or editor/viewer roles',
      );
    }

    if (actorRoleId > 2) {
      if (actorUserId === targetUserId) return targetRole;
      throw new ForbiddenException(
        'Editors and viewers can only remove their own roles',
      );
    }

    throw new ForbiddenException('Insufficient permissions');
  }

  // ✅ Transfer ownership validator
  async validateTransferOwnership(
    accountId: number,
    currentOwnerId: number,
    newOwnerId: number,
    manager?: EntityManager,
  ) {
    const currentOwner = await this.ensureExists(
      accountId,
      currentOwnerId,
      manager,
    );
    if (currentOwner.roleId !== 1)
      throw new ForbiddenException('Only current owner can transfer ownership');
    if (currentOwnerId === newOwnerId)
      throw new BadRequestException('Cannot transfer ownership to self');

    const repo = this.getRepo(manager);
    const newOwner = await repo.findOne({
      where: { accountId, userId: newOwnerId },
    });

    return { currentOwner, newOwner };
  }

  // ✅ Ownership check
  ensureOwner(ownerId: number, userId: number) {
    if (ownerId !== userId)
      throw new ForbiddenException('User is not the owner of this account');
  }

  // ✅ Owner or admin
  async ensureOwnerOrAdmin(
    accountId: number,
    userId: number,
    manager?: EntityManager,
  ) {
    const role = await this.ensureExists(accountId, userId, manager);
    if (![1, 2].includes(role.roleId))
      throw new ForbiddenException('Only owner or admin allowed');
    return role;
  }

  // ✅ Owner, admin, or editor
  async ensureOwnerAdminOrEditor(
    accountId: number,
    userId: number,
    manager?: EntityManager,
  ) {
    const role = await this.ensureExists(accountId, userId, manager);
    if (![1, 2, 3].includes(role.roleId))
      throw new ForbiddenException('Only owner, admin, or editor allowed');
    return role;
  }
}
