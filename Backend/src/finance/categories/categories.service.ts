import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Category } from './categories.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FilterCategoriesDto } from './dto/filter-category.dto';
import { User } from 'src/auth/user.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /** CREATE */
  async create(
    createCategoryDto: CreateCategoryDto,
    user: User,
  ): Promise<Category> {
    if (!user) {
      throw new BadRequestException('Cannot create category without a user');
    }

    const category = this.categoryRepository.create({
      ...createCategoryDto,
      user,
    });

    return await this.categoryRepository.save(category);
  }

  /** FIND ALL */
  async findAll(
    filterDto: FilterCategoriesDto,
    userId?: number,
  ): Promise<Category[]> {
    const { ownership, categoryType } = filterDto;

    const where: any = {};

    // ownership filter
    if (ownership === 'system') {
      where.user = IsNull();
    } else if (ownership === 'user' && userId) {
      where.user = { id: userId };
    }

    // income / expense filter
    if (categoryType) {
      where.type = categoryType;
    }

    return await this.categoryRepository.find({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /** FIND ONE */
  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  /** UPDATE */
  async update(
    id: number,
    updateData: UpdateCategoryDto,
    userId: number,
  ): Promise<Category> {
    const category = await this.findOne(id);

    if (!category.user || category.user.id !== userId) {
      throw new BadRequestException(
        'Cannot update system or other users categories',
      );
    }

    Object.assign(category, updateData);
    return await this.categoryRepository.save(category);
  }

  /** DELETE */
  async remove(id: number, userId: number): Promise<void> {
    const category = await this.findOne(id);

    if (!category.user || category.user.id !== userId) {
      throw new BadRequestException(
        'Cannot delete system or other users categories',
      );
    }

    await this.categoryRepository.remove(category);
  }

  /** STATS */
  async getStats(userId?: number) {
    const total = await this.categoryRepository.count();
    const totalIncome = await this.categoryRepository.count({
      where: { type: 'income' },
    });
    const systemIncome = await this.categoryRepository.count({
      where: { type: 'income', user: IsNull() },
    });
    const userIncome = userId
      ? await this.categoryRepository.count({
          where: { type: 'income', user: { id: userId } },
        })
      : 0;

    const totalExpense = await this.categoryRepository.count({
      where: { type: 'expense' },
    });
    const systemExpense = await this.categoryRepository.count({
      where: { type: 'expense', user: IsNull() },
    });
    const userExpense = userId
      ? await this.categoryRepository.count({
          where: { type: 'expense', user: { id: userId } },
        })
      : 0;

    return {
      total,
      income: { total: totalIncome, system: systemIncome, user: userIncome },
      expense: {
        total: totalExpense,
        system: systemExpense,
        user: userExpense,
      },
    };
  }
}
