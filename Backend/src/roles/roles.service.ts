// src/roles/roles.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  //   async create(dto: CreateRoleDto) {
  //     const role = this.roleRepo.create(dto);
  //     await this.roleRepo.save(role);
  //     return role;
  //   }

  async findAll(): Promise<Role[]> {
    return this.roleRepo.find();
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  //   async update(id: number, dto: UpdateRoleDto): Promise<Role> {
  //     const role = await this.roleRepo.preload({ id, ...dto });
  //     if (!role) throw new NotFoundException('Role not found');
  //     return this.roleRepo.save(role);
  //   }

  //   async remove(id: number): Promise<void> {
  //     const role = await this.roleRepo.findOne({ where: { id } });
  //     if (!role) throw new NotFoundException('Role not found');
  //     await this.roleRepo.remove(role);
  //   }
}
