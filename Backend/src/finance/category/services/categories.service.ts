// src/categories/categories.service.ts
import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repository/category.repository';
import { CategoryValidator } from '../validators/category.validator';
import { CategoryTransformer } from '../transformers/category.transformer';

import { CategoryScope, CategoryType } from '../entity/categories.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { User } from 'src/auth/entity/user.entity';
import { CategoryStatsDto } from '../dto/category-stats.dto';
import { ApiResponse } from 'src/common/types/api-response.type';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly validator: CategoryValidator,
  ) {}

  async createCategory(
    user: User,
    dto: CreateCategoryDto,
  ): Promise<ApiResponse<any>> {
    const scope = CategoryScope.INDIVIDUAL;

    await this.validator.ensureNoDuplicate(dto.name, scope, user.id);

    const category = await this.categoryRepo.save({
      ...dto,
      scope,
      userId: user.id,
    });

    return {
      success: true,
      message: 'Category created successfully',
      data: CategoryTransformer.toResponse(category),
    };
  }

  async updateCategory(
    id: number,
    dto: UpdateCategoryDto,
    user: User,
  ): Promise<ApiResponse<any>> {
    const category = await this.validator.ensureExists(id);
    this.validator.ensureUpdatable(category, user.id);

    Object.assign(category, dto);
    const updated = await this.categoryRepo.save(category);

    return {
      success: true,
      message: 'Category updated successfully',
      data: CategoryTransformer.toResponse(updated),
    };
  }

  async deleteCategory(id: number, user: User): Promise<ApiResponse<null>> {
    const category = await this.validator.ensureExists(id);
    this.validator.ensureUpdatable(category, user.id);

    await this.categoryRepo.remove(category);

    return {
      success: true,
      message: 'Category deleted successfully',
      data: null,
    };
  }

  async getCategory(id: number, user: User): Promise<ApiResponse<any>> {
    const category = await this.validator.ensureExists(id);
    this.validator.ensureReadable(category, user.id);

    return {
      success: true,
      message: 'Category retrieved successfully',
      data: CategoryTransformer.toResponse(category),
    };
  }

  async listCategories(
    user: User,
    type?: CategoryType,
    search?: string,
    scope?: CategoryScope,
  ): Promise<ApiResponse<any[]>> {
    const categories = await this.categoryRepo.listForUser(
      user.id,
      type,
      search,
      scope,
    );
    console.log(type, search);
    return {
      success: true,
      message: 'Categories fetched successfully',
      data: CategoryTransformer.toResponseList(categories),
    };
  }

  async getCategoryStats(): Promise<ApiResponse<CategoryStatsDto>> {
    const raw = await this.categoryRepo.getStats();

    const stats: CategoryStatsDto = {
      total: 0,
      income: { total: 0, system: 0, user: 0 },
      expense: { total: 0, system: 0, user: 0 },
    };

    raw.forEach((r) => {
      const type = r.type as 'income' | 'expense';
      const owner = r.owner as 'system' | 'user';
      const count = Number(r.count);

      stats.total += count;
      stats[type].total += count;
      stats[type][owner] = count;
    });

    return {
      success: true,
      message: 'Category statistics retrieved successfully',
      data: stats,
    };
  }
}
