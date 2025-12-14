import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entity/role.entity';

@Injectable()
export class RolesRepository {
  constructor(
    @InjectRepository(Role)
    private readonly repo: Repository<Role>,
  ) {}

  async truncate() {
    await this.repo.query('TRUNCATE TABLE roles RESTART IDENTITY CASCADE');
  }

  async saveMany(data: Partial<Role>[]) {
    const entities = this.repo.create(data);
    return this.repo.save(entities);
  }

  async findAll() {
    return this.repo.find({
      select: ['id', 'name', 'displayName', 'description', 'isSystem'],
    });
  }

  async findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }
}
