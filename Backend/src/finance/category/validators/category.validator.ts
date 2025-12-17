// src/categories/validators/category.validator.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoryRepository } from '../repository/category.repository';
import { Category, CategoryScope } from '../entity/categories.entity';

@Injectable()
export class CategoryValidator {
  constructor(private readonly categoryRepo: CategoryRepository) {}

  async ensureExists(id: number): Promise<Category> {
    const category = await this.categoryRepo.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  ensureUpdatable(category: Category, userId: number) {
    if (
      category.scope === CategoryScope.GLOBAL ||
      category.scope === CategoryScope.BUSINESS
    ) {
      throw new BadRequestException('Cannot modify system category');
    }

    if (
      category.scope === CategoryScope.INDIVIDUAL &&
      category.userId !== userId
    ) {
      throw new BadRequestException('Not authorized');
    }
  }

  ensureReadable(category: Category, userId: number) {
    if (
      category.scope === CategoryScope.INDIVIDUAL &&
      category.userId !== userId
    ) {
      throw new BadRequestException('Not authorized');
    }
  }

  async ensureNoDuplicate(name: string, scope: CategoryScope, userId?: number) {
    const existing = await this.categoryRepo.findDuplicate(name, scope, userId);

    if (existing) {
      throw new BadRequestException('Category with this name already exists');
    }
  }
}
