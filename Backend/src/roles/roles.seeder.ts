// src/roles/roles.seeder.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Command } from 'nestjs-command';
import { Role } from './role.entity';

const defaultRoles = [
  {
    name: 'owner',
    displayName: 'Owner',
    description: 'Full access to everything',
  },
  { name: 'admin', displayName: 'Admin', description: 'Admin privileges' },
  { name: 'editor', displayName: 'Editor', description: 'Can edit content' },
  { name: 'viewer', displayName: 'Viewer', description: 'Read-only access' },
];

@Injectable()
export class RolesSeeder {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  @Command({ command: 'roles:run', describe: 'Seed default roles' })
  async seed() {
    try {
      console.log('🧹 Truncating roles table...');
      await this.dataSource.query(
        'TRUNCATE TABLE roles RESTART IDENTITY CASCADE;',
      );

      console.log('📥 Seeding default roles...');
      for (const r of defaultRoles) {
        const role = this.roleRepo.create(r);
        await this.roleRepo.save(role);
      }

      console.log('✅ Roles seeded successfully!');
    } catch (err) {
      console.error('❌ Failed to seed roles:', err);
    }
  }
}
