import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountUserRole } from '../entity/account-user-role.entity';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { Role } from 'src/roles/role.entity';
import { AccountUserRoleDto } from '../dto/account-user-role.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AccountUserRolesService {
  constructor(
    @InjectRepository(AccountUserRole)
    private readonly roleRepo: Repository<AccountUserRole>,
    @InjectRepository(Role)
    private readonly rolesRepo: Repository<Role>,
  ) {}

  async assignRole(
    accountId: number,
    dto: AssignRoleDto,
  ): Promise<AccountUserRole> {
    const role = await this.rolesRepo.findOne({ where: { id: dto.roleId } });
    if (!role) throw new NotFoundException(`Role ID ${dto.roleId} not found`);

    const accountUserRole = this.roleRepo.create({
      accountId,
      userId: dto.userId,
      role,
    });

    return await this.roleRepo.save(accountUserRole);
  }

  async updateRole(
    accountId: number,
    userId: number,
    dto: UpdateRoleDto,
  ): Promise<AccountUserRole> {
    const accountUserRole = await this.roleRepo.findOne({
      where: { accountId, userId },
      relations: ['role'],
    });
    if (!accountUserRole) throw new NotFoundException(`User role not found`);

    const role = await this.rolesRepo.findOne({ where: { id: dto.roleId } });
    if (!role) throw new NotFoundException(`Role ID ${dto.roleId} not found`);

    accountUserRole.role = role;
    return await this.roleRepo.save(accountUserRole);
  }

  async removeRole(accountId: number, userId: number): Promise<void> {
    const accountUserRole = await this.roleRepo.findOne({
      where: { accountId, userId },
    });
    if (!accountUserRole) {
      throw new NotFoundException(
        `Role for user ${userId} not found on account ${accountId}`,
      );
    }

    await this.roleRepo.remove(accountUserRole);
  }

  async listRoles(accountId: number): Promise<AccountUserRoleDto[]> {
    const roles = await this.roleRepo.find({
      where: { accountId },
      relations: ['role', 'user'],
    });

    // Transform entities to DTOs
    return plainToInstance(AccountUserRoleDto, roles, {
      excludeExtraneousValues: true,
    });
  }
}
