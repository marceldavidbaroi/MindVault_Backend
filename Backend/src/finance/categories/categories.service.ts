import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, CategoryScope, CategoryType } from './categories.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}
  async createCategory(user: User, dto: CreateCategoryDto): Promise<Category> {
    // Prevent creating global categories
    if (dto.scope === CategoryScope.GLOBAL) {
      throw new BadRequestException('Cannot create global category');
    }

    const category = this.categoryRepo.create({
      ...dto,
      user:
        dto.scope === CategoryScope.INDIVIDUAL ||
        dto.scope === CategoryScope.FAMILY
          ? user
          : undefined,
      scope: dto.scope || CategoryScope.INDIVIDUAL, // default to GLOBAL? maybe change default to INDIVIDUAL
    });

    return this.categoryRepo.save(category);
  }

  async updateCategory(
    id: number,
    dto: UpdateCategoryDto,
    user: User,
  ): Promise<Category> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    // Only allow updates for allowed scopes
    if (category.scope === CategoryScope.GLOBAL)
      throw new BadRequestException('Cannot update global category');
    if (
      category.scope === CategoryScope.INDIVIDUAL &&
      category.user?.id !== user.id
    ) {
      throw new BadRequestException('Not authorized to update this category');
    }

    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  async deleteCategory(id: number, user: User): Promise<void> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    if (category.scope === CategoryScope.GLOBAL)
      throw new BadRequestException('Cannot delete global category');
    if (
      category.scope === CategoryScope.INDIVIDUAL &&
      category.user?.id !== user.id
    ) {
      throw new BadRequestException('Not authorized to delete this category');
    }

    await this.categoryRepo.remove(category);
  }
  async getCategory(id: number, user: User): Promise<Category> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    // Allow viewing if:
    // - Not individual (GLOBAL, BUSINESS, FAMILY)
    // - Or individual AND either owned by user OR system-defined (user = null)
    if (
      category.scope === CategoryScope.INDIVIDUAL &&
      category.user?.id !== user.id &&
      category.user !== undefined // means it's user-defined
    ) {
      throw new BadRequestException('Not authorized to view this category');
    }

    return category;
  }

  async listCategories(
    user: User,
    type?: CategoryType,
    search?: string,
    scope?: CategoryScope,
  ): Promise<Category[]> {
    const qb = this.categoryRepo.createQueryBuilder('category');

    // Scope filters: global or user's individual/family categories
    qb.where(
      '(category.scope = :global OR category.user_id = :userId OR category.scope = :family)',
      {
        global: CategoryScope.GLOBAL,
        userId: user.id,
        family: CategoryScope.FAMILY,
      },
    );

    if (scope) qb.andWhere('category.scope = :scope', { scope });
    if (type) qb.andWhere('category.type = :type', { type });
    if (search)
      qb.andWhere(
        'category.name ILIKE :search OR category.display_name ILIKE :search',
        {
          search: `%${search}%`,
        },
      );

    return qb.getMany();
  }

  async verifyCategory(id: number): Promise<Category> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new BadRequestException('Invalid categoryId');
    return category;
  }
}
