// categories.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category } from './categories.entity';
import { CategoriesSeeder } from './categories.seeder';
import { CommandModule } from 'nestjs-command';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), CommandModule],
  controllers: [CategoriesController],
  providers: [CategoriesSeeder, CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
