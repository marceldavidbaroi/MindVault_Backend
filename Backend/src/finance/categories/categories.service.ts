import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Category,
  CategoryScope,
  CategoryStats,
  CategoryType,
} from './categories.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  // --------------------------------------------------------------------------
  // 🟢 CREATE CATEGORY
  // --------------------------------------------------------------------------
  async createCategory(user: User, dto: CreateCategoryDto): Promise<Category> {
    // Always individual scope for user-created categories
    const scope = CategoryScope.INDIVIDUAL;

    // Check for duplicates
    const existing = await this.categoryRepo.findOne({
      where: { name: dto.name, user: { id: user.id }, scope },
    });
    if (existing) {
      throw new BadRequestException('Category with this name already exists');
    }

    const category = this.categoryRepo.create({
      ...dto,
      user,
      scope,
    });

    return this.categoryRepo.save(category);
  }

  // --------------------------------------------------------------------------
  // 🟡 UPDATE CATEGORY
  // --------------------------------------------------------------------------
  async updateCategory(
    id: number,
    dto: UpdateCategoryDto,
    user: User,
  ): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!category) throw new NotFoundException('Category not found');

    if (
      category.scope === CategoryScope.GLOBAL ||
      category.scope === CategoryScope.BUSINESS
    ) {
      throw new BadRequestException('Cannot update system category');
    }

    if (
      category.scope === CategoryScope.INDIVIDUAL &&
      category.user?.id !== user.id
    ) {
      throw new BadRequestException('Not authorized to update this category');
    }

    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  // --------------------------------------------------------------------------
  // 🔴 DELETE CATEGORY
  // --------------------------------------------------------------------------
  async deleteCategory(id: number, user: User): Promise<void> {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!category) throw new NotFoundException('Category not found');

    if (
      category.scope === CategoryScope.GLOBAL ||
      category.scope === CategoryScope.BUSINESS
    ) {
      throw new BadRequestException('Cannot delete system category');
    }

    if (category.user?.id !== user.id) {
      throw new BadRequestException('Not authorized to delete this category');
    }

    await this.categoryRepo.remove(category);
  }

  // --------------------------------------------------------------------------
  // 🔍 GET SINGLE CATEGORY
  // --------------------------------------------------------------------------
  async getCategory(id: number, user: User): Promise<Category> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    if (
      category.scope === CategoryScope.INDIVIDUAL &&
      category.user?.id !== user.id &&
      category.user !== undefined
    ) {
      throw new BadRequestException('Not authorized to view this category');
    }

    return category;
  }

  // --------------------------------------------------------------------------
  // 📋 LIST CATEGORIES (SYSTEM + USER)
  // --------------------------------------------------------------------------
  async listCategories(
    user: User,
    type?: CategoryType,
    search?: string,
    scope?: CategoryScope,
  ): Promise<Category[]> {
    const qb = this.categoryRepo
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.user', 'user');

    // Select only specific fields
    qb.select([
      'category.id',
      'category.name',
      'category.displayName',
      'category.type',
      'category.scope',
      'user.id',
      'user.username',
    ]);

    // Include all system categories + user-created categories
    qb.where(
      'category.scope IN (:...systemScopes) OR category.user_id = :userId',
      {
        systemScopes: [
          CategoryScope.GLOBAL,
          CategoryScope.BUSINESS,
          CategoryScope.FAMILY,
        ],
        userId: user.id,
      },
    );

    // Optional filters
    if (scope) qb.andWhere('category.scope = :scope', { scope });
    if (type) qb.andWhere('category.type = :type', { type });
    if (search)
      qb.andWhere(
        'category.name ILIKE :search OR category.display_name ILIKE :search',
        { search: `%${search}%` },
      );

    return qb.getMany();
  }

  // --------------------------------------------------------------------------
  // 🧾 VERIFY CATEGORY EXISTS
  // --------------------------------------------------------------------------
  async verifyCategory(id: number): Promise<Category> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new BadRequestException('Invalid categoryId');
    return category;
  }

  // --------------------------------------------------------------------------
  // 📊 GET CATEGORY STATS
  // --------------------------------------------------------------------------
  async getCategoryStats(user: User): Promise<CategoryStats> {
    const qb = this.categoryRepo.createQueryBuilder('category');

    // Count categories grouped by type and owner (system/user)
    const categories = await qb
      .select('category.type', 'type')
      .addSelect(
        `CASE WHEN category.user_id IS NULL THEN 'system' ELSE 'user' END`,
        'owner',
      )
      .addSelect('COUNT(category.id)', 'count')
      .groupBy('category.type')
      .addGroupBy('owner')
      .getRawMany();

    const stats: CategoryStats = {
      total: 0,
      income: { total: 0, system: 0, user: 0 },
      expense: { total: 0, system: 0, user: 0 },
    };

    categories.forEach((c) => {
      const type = c.type as 'income' | 'expense';
      const owner = c.owner as 'system' | 'user';
      const count = parseInt(c.count, 10);

      stats.total += count;
      stats[type].total += count;
      stats[type][owner] = count;
    });

    return stats;
  }
}
