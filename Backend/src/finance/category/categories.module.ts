// categories.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entity/categories.entity';
import { CategoriesSeeder } from './seeder/categories.seeder';
import { CommandModule } from 'nestjs-command';
import { CategoryValidator } from './validators/category.validator';
import { CategoriesService } from './services/categories.service';
import { CategoryTransformer } from './transformers/category.transformer';
import { CategoryRepository } from './repository/category.repository';
import { CategoriesController } from './controller/categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), CommandModule],
  controllers: [CategoriesController],
  providers: [
    CategoriesSeeder,
    CategoryValidator,
    CategoriesService,
    CategoryTransformer,
    CategoryRepository,
  ],
  exports: [CategoryValidator],
})
export class CategoriesModule {}
