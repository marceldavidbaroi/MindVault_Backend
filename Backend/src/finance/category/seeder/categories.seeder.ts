// src/categories/seeder/categories.seeder.ts
import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { DataSource } from 'typeorm';
import { CategoryRepository } from '../repository/category.repository';
import { defaultCategories } from '../data/categories.data';

@Injectable()
export class CategoriesSeeder {
  constructor(
    private readonly dataSource: DataSource,
    private readonly categoryRepo: CategoryRepository,
  ) {}

  @Command({
    command: 'categories:seed',
    describe: 'Seed default system categories',
  })
  async seed(): Promise<void> {
    console.log('🧹 Resetting categories table...');

    // ✅ Full reset: data + identity + dependent FKs
    await this.dataSource.query(
      'TRUNCATE TABLE categories RESTART IDENTITY CASCADE;',
    );

    console.log('📥 Inserting default categories...');

    // ✅ Single bulk insert (fast & clean)
    await this.categoryRepo.saveMany(defaultCategories);

    console.log('✅ Categories seeded successfully!');
  }
}
