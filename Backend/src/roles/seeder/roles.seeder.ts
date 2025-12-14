import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { DataSource } from 'typeorm';
import { RolesRepository } from '../repository/roles.repository';
import { defaultRoles } from '../data/roles.data';

@Injectable()
export class RolesSeeder {
  constructor(
    private readonly dataSource: DataSource,
    private readonly repository: RolesRepository,
  ) {}

  @Command({ command: 'roles:seed', describe: 'Seed default roles' })
  async seed() {
    console.log('🧹 Truncating roles table...');
    await this.dataSource.query(
      'TRUNCATE TABLE roles RESTART IDENTITY CASCADE;',
    );

    console.log('📥 Seeding default roles...');
    await this.repository.saveMany(defaultRoles);

    console.log('✅ Default roles seeded successfully!');
  }
}
