import { Injectable } from '@nestjs/common';
import { AccountUserRoleRepository } from '../repository/account-user-role.repository';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { AccountUserRoleTransformer } from '../transformers/account-user-role.transformer';
import { User } from 'src/auth/entity/user.entity';
import { RolesValidator } from 'src/roles/validators/roles.validator';
import { UserValidator } from 'src/auth/validator/user.validator';
import { AccountValidator } from '../validators/account.validator';
import { AccountUserRoleValidator } from '../validators/account-user-role.validator';

@Injectable()
export class AccountUserRolesService {
  constructor(
    private readonly repo: AccountUserRoleRepository,
    private readonly rolesValidator: RolesValidator,
    private readonly userValidator: UserValidator,
    private readonly accountValidator: AccountValidator,
    private readonly accountUserRoleValidator: AccountUserRoleValidator,
  ) {}

  /** Create owner role */
  async createOwner(accountId: number, user: User) {
    const account = await this.accountValidator.ensureExists(accountId);
    this.accountUserRoleValidator.ensureOwner(account.ownerId, user.id);
    return this.repo.save({
      accountId,
      userId: user.id,
      roleId: 1,
    });
  }

  /** Assign role */
  async addRole(actorRoleId: number, accountId: number, dto: AssignRoleDto) {
    await this.accountValidator.ensureExists(accountId);
    await this.userValidator.ensureUserExists(dto.userId);
    await this.rolesValidator.ensureExists(dto.roleId);
    await this.accountUserRoleValidator.assignRoleValidator(
      actorRoleId,
      accountId,
      dto.userId,
      dto.roleId,
    );

    return this.repo.save({
      accountId,
      userId: dto.userId,
      roleId: dto.roleId,
    });
  }

  /** Update role */
  async updateRole(
    actorRoleId: number,
    accountId: number,
    userId: number,
    dto: UpdateRoleDto,
  ) {
    await this.accountValidator.ensureExists(accountId);
    await this.userValidator.ensureUserExists(userId);
    await this.rolesValidator.ensureExists(dto.roleId);
    const targetRole = await this.accountUserRoleValidator.updateRoleValidator(
      actorRoleId,
      accountId,
      userId,
      dto.roleId,
    );

    targetRole.roleId = dto.roleId;
    return this.repo.save(targetRole);
  }

  /** Remove role */
  async removeRole(
    actorUserId: number,
    accountId: number,
    targetUserId: number,
  ) {
    await this.accountValidator.ensureExists(accountId);
    await this.userValidator.ensureUserExists(targetUserId);

    const target = await this.accountUserRoleValidator.validateRemoveRole(
      accountId,
      actorUserId,
      targetUserId,
    );

    await this.repo.remove(target);
  }

  /** Transfer ownership */
  async transferOwnership(
    accountId: number,
    currentOwnerId: number,
    newOwnerId: number,
  ) {
    const { currentOwner, newOwner } =
      await this.accountUserRoleValidator.validateTransferOwnership(
        accountId,
        currentOwnerId,
        newOwnerId,
      );

    // Demote current owner
    currentOwner.roleId = 2;
    await this.repo.save(currentOwner);

    if (newOwner) {

      add a another logic to update the account owner id
      newOwner.roleId = 1;
      await this.repo.save(newOwner);
    } else {
      await this.repo.save({
        accountId,
        userId: newOwnerId,
        roleId: 1,
      });
    }
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
