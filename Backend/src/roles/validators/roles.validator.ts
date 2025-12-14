import { Injectable, NotFoundException } from '@nestjs/common';
import { RolesRepository } from '../repository/roles.repository';
import { Role } from '../entity/role.entity';

@Injectable()
export class RolesValidator {
  constructor(private readonly repository: RolesRepository) {}

  async ensureExists(id: number): Promise<Role> {
    const role = await this.repository.findById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }
}
