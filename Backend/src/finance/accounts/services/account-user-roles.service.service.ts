import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountUserRole } from '../entity/account-user-role.entity';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { Role } from 'src/roles/role.entity';
import { VerifyUserService } from 'src/auth/services/verify-user.service';
import { AccountsService } from './accounts.service';
import { RolesService } from 'src/roles/roles.service';
import { User } from 'src/auth/entities/user.entity';
import { Account } from '../entity/account.entity';

@Injectable()
export class AccountUserRolesService {
  constructor(
    @InjectRepository(AccountUserRole)
    private readonly roleRepo: Repository<AccountUserRole>,
    private readonly verifyUserService: VerifyUserService,
    @Inject(forwardRef(() => AccountsService))
    private readonly accountsService: AccountsService,
    private readonly rolesService: RolesService,
  ) {}

  /** Helper method to find a single AccountUserRole by accountId and userId */
  async findOne(accountId: number, userId: number): Promise<AccountUserRole> {
    const accountUserRole = await this.roleRepo.findOne({
      where: { account: { id: accountId }, user: { id: userId } },
      relations: ['role', 'user', 'account'],
    });

    if (!accountUserRole) {
      throw new NotFoundException(
        `Role for user ${userId} not found on account ${accountId}`,
      );
    }

    return accountUserRole;
  }

  async currentUserRole(accountId: number, userId: number): Promise<string> {
    const accountUserRole = await this.findOne(accountId, userId);
    return accountUserRole.role.name;
  }

  async assignOwnerRole(user: User, account: Account) {
    const ownerRole = await this.rolesService.findOne(1);

    // Check if the user already has a role in this account
    const existing = await this.roleRepo.findOne({
      where: {
        account: { id: account.id },
        user: { id: user.id },
      },
    });

    if (existing) {
      // Update the role to owner if not already
      existing.role = ownerRole;
      return await this.roleRepo.save(existing);
    }

    // Otherwise, create a new owner role entry
    const accountUserRole = this.roleRepo.create({
      account,
      user,
      role: ownerRole,
    });

    return await this.roleRepo.save(accountUserRole);
  }

  /** Assign a role to a user for an account */
  async assignRole(owner: User, accountId: number, dto: AssignRoleDto) {
    // Prevent assigning Owner role
    if (dto.roleId === 1) {
      throw new BadRequestException(
        'Cannot assign Owner role using this method. Use assignOwnerRole or transferOwnership.',
      );
    }

    const userRole = await this.findOne(accountId, owner.id);
    if (userRole.role.name !== 'owner' && userRole.role.name !== 'admin') {
      throw new ForbiddenException(
        'You do not have permission to update this account.',
      );
    }

    const role = await this.rolesService.findOne(dto.roleId);
    const user = await this.verifyUserService.verify(dto.username);
    const account = await this.accountsService.getAccount(accountId, owner);

    // Check if the user already has a role for this account
    const existing = await this.roleRepo.findOne({
      where: { account: { id: account.id }, user: { id: user.id } },
    });

    if (existing) {
      throw new BadRequestException(
        `User ${user.id} already has a role (${existing.role.displayName}) on this account`,
      );
    }

    const accountUserRole = this.roleRepo.create({
      account,
      user,
      role,
    });

    return await this.roleRepo.save(accountUserRole);
  }

  /** Update an existing role for a user on an account */
  async updateRole(
    currentUser: User,
    accountId: number,
    userId: number,
    dto: UpdateRoleDto,
  ): Promise<AccountUserRole> {
    // Prevent updating role to Owner
    if (dto.roleId === 1) {
      throw new BadRequestException(
        'Cannot assign Owner role using this method. Use assignOwnerRole or transferOwnership.',
      );
    }

    const currentUserRole = await this.findOne(accountId, currentUser.id);

    // Only Owner (1) or Admin (2) can update roles
    if (![1, 2].includes(currentUserRole.role.id)) {
      throw new ForbiddenException(
        'Only Owner or Admin can update roles on this account',
      );
    }

    const targetUserRole = await this.findOne(accountId, userId);
    const newRole = await this.rolesService.findOne(dto.roleId);

    // Prevent downgrading an owner (already handled separately)
    if (targetUserRole.role.id === 1) {
      throw new BadRequestException(
        'Owner role can only be changed using transferOwnership.',
      );
    }

    targetUserRole.role = newRole;
    return await this.roleRepo.save(targetUserRole);
  }

  /** Remove a user's role from an account */
  async removeRole(
    currentUser: User,
    accountId: number,
    userId: number,
  ): Promise<void> {
    const currentUserRole = await this.findOne(accountId, currentUser.id);
    const targetUserRole = await this.findOne(accountId, userId);

    // Rules:
    // - Admin (2) can delete editor (3) or viewer (4)
    // - Owner (1) can delete anyone, but at least one role must remain
    // - User can delete their own role if they are not the owner

    if (currentUser.id === userId) {
      // self-removal
      if (currentUserRole.role.id === 1) {
        throw new BadRequestException('Owner cannot remove their own role');
      }
    } else {
      if (currentUserRole.role.id === 2) {
        // Admin permissions
        if (![3].includes(targetUserRole.role.id)) {
          throw new ForbiddenException(
            'Admin can only remove Editor or Viewer roles',
          );
        }
      } else if (currentUserRole.role.id === 1) {
        // Owner permissions
        const roleCount = await this.roleRepo.count({
          where: { account: { id: accountId } },
        });
        if (roleCount <= 1) {
          throw new BadRequestException(
            'At least one user must be associated with the account',
          );
        }
      } else {
        throw new ForbiddenException(
          'You do not have permission to remove this role',
        );
      }
    }

    await this.roleRepo.remove(targetUserRole);
  }

  /** List all roles for an account */
  async listRoles(accountId: number) {
    const roles = await this.roleRepo.find({
      where: { account: { id: accountId } },
      relations: ['role', 'user'],
    });
    return roles;
  }

  /** Get all accounts with their roles for a user */
  async getUserAccountsWithRoles(user: User): Promise<any[]> {
    await this.verifyUserService.verify(user.id);

    const roles = await this.roleRepo.find({
      where: { user: { id: user.id } },
      relations: ['role', 'account', 'account.currency'],
    });
    return roles.map(({ id, account, role }) => ({
      id,
      account: {
        id: account.id,
        name: account.name,
        description: account.description,
        initialBalance: account.initialBalance,
        balance: account.balance,
        ownerId: account.ownerId,
        currency: account.currency?.code,
      },
      role: {
        id: role.id,
        name: role.name,
        displayName: role.displayName,
        description: role.description,
      },
    }));
  }

  /** Get user’s role for an account */
  async getUserRoleForAccount(
    userId: number,
    accountId: number,
  ): Promise<Account> {
    const accountUserRole = await this.roleRepo.findOne({
      where: { user: { id: userId }, account: { id: accountId } },
      relations: ['role', 'account'],
    });

    if (!accountUserRole) {
      throw new BadRequestException('You have no role on this account');
    }
    const allowedRoleIds = [1, 2, 3];
    if (!allowedRoleIds.includes(accountUserRole.role.id)) {
      throw new BadRequestException(
        'You have no permission to add transactions to this account',
      );
    }

    return accountUserRole.account;
  }

  /** Transfer ownership of an account to another user */
  async transferOwnership(
    currentOwner: User,
    accountId: number,
    newOwnerId: number,
  ): Promise<void> {
    const currentOwnerRole = await this.findOne(accountId, currentOwner.id);

    if (currentOwnerRole.role.id !== 1) {
      throw new ForbiddenException(
        'Only the current owner can transfer ownership',
      );
    }

    const newOwnerRole = await this.findOne(accountId, newOwnerId).catch(
      () => null,
    );
    const ownerRole = await this.rolesService.findOne(1);
    const adminRole = await this.rolesService.findOne(2);

    if (newOwnerRole) {
      // If user already has a role, promote to owner
      newOwnerRole.role = ownerRole;
      await this.roleRepo.save(newOwnerRole);
    } else {
      // Assign owner role to user if not yet assigned
      const newOwnerUser = await this.verifyUserService.verify(newOwnerId);
      const account = await this.accountsService.getAccount(
        accountId,
        currentOwner,
      );
      const newRole = this.roleRepo.create({
        account,
        user: newOwnerUser,
        role: ownerRole,
      });
      await this.roleRepo.save(newRole);
    }

    // Demote current owner to admin
    currentOwnerRole.role = adminRole;
    await this.roleRepo.save(currentOwnerRole);
  }
}
