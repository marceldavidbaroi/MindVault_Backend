import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Command } from 'nestjs-command';
import { Category } from './categories.entity';
import { defaultCategories } from './categories.data';

@Injectable()
export class CategoriesSeeder {
  constructor(
    private readonly dataSource: DataSource, // Use DataSource to run raw queries
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  @Command({
    command: 'categories:run',
    describe: 'Seed default categories',
  })
  async seed() {
    try {
      console.log('🧹 Truncating categories table...');

      // Truncate table and restart identity (auto-increment)
      await this.dataSource.query(
        `TRUNCATE TABLE categories RESTART IDENTITY CASCADE;`,
      );

      console.log('📥 Seeding default categories...');
      for (const c of defaultCategories) {
        const category = this.categoryRepo.create(c);
        await this.categoryRepo.save(category);
      }

      console.log('✅ Categories seeded successfully!');
    } catch (err) {
      console.error('❌ Failed to seed categories:', err);
    }
  }
}
