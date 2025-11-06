import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountUserRole } from '../entity/account-user-role.entity';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { Role } from 'src/roles/role.entity';
import { AccountUserRoleDto } from '../dto/account-user-role.dto';
import { plainToInstance } from 'class-transformer';
import { VerifyUserService } from 'src/auth/services/verify-user.service';
import { AccountsService } from './accounts.service';
import { RolesService } from 'src/roles/roles.service';

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

  /** Assign a role to a user for an account */
  async assignRole(
    accountId: number,
    dto: AssignRoleDto,
  ): Promise<AccountUserRole> {
    console.log('this is called');
    const role = await this.rolesService.findOne(dto.roleId);
    const user = await this.verifyUserService.verify(dto.userId);
    const account = await this.accountsService.getAccount(accountId, user);

    const accountUserRole = this.roleRepo.create({
      account,
      user,
      role,
    });

    return await this.roleRepo.save(accountUserRole);
  }

  /** Update an existing role for a user on an account */
  async updateRole(
    accountId: number,
    userId: number,
    dto: UpdateRoleDto,
  ): Promise<AccountUserRole> {
    const accountUserRole = await this.findOne(accountId, userId);

    const role = await this.rolesService.findOne(dto.roleId);
    accountUserRole.role = role;

    return await this.roleRepo.save(accountUserRole);
  }

  /** Remove a user's role from an account */
  async removeRole(accountId: number, userId: number): Promise<void> {
    const accountUserRole = await this.findOne(accountId, userId);
    await this.roleRepo.remove(accountUserRole);
  }

  /** List all roles for an account */
  async listRoles(accountId: number): Promise<any> {
    const roles = await this.roleRepo.find({
      where: { account: { id: accountId } },
      relations: ['role', 'user'],
    });
    return roles;

    // return plainToInstance(AccountUserRoleDto, roles, {
    //   excludeExtraneousValues: true,
    // });
  }
}
