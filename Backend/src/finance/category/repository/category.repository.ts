// src/categories/repository/category.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import {
  Category,
  CategoryScope,
  CategoryType,
} from '../entity/categories.entity';

@Injectable()
export class CategoryRepository extends Repository<Category> {
  constructor(private readonly dataSource: DataSource) {
    super(Category, dataSource.createEntityManager());
  }

  findById(id: number): Promise<Category | null> {
    return this.findOne({ where: { id } });
  }

  findDuplicate(
    name: string,
    scope: CategoryScope,
    userId?: number,
  ): Promise<Category | null> {
    return this.findOne({
      where: { name, scope, userId: userId ?? undefined },
    });
  }

  listForUser(
    userId: number,
    type?: CategoryType,
    search?: string,
    scope?: CategoryScope,
  ): Promise<Category[]> {
    const qb = this.createQueryBuilder('category');

    // 🔥 FIX: wrap OR condition in brackets
    qb.where(
      `
    (
      category.scope IN (:...systemScopes)
      OR category.user_id = :userId
    )
    `,
      {
        systemScopes: [
          CategoryScope.GLOBAL,
          CategoryScope.BUSINESS,
          CategoryScope.FAMILY,
        ],
        userId,
      },
    );

    if (scope) {
      qb.andWhere('category.scope = :scope', { scope });
    }

    if (type) {
      qb.andWhere('category.type = :type', { type });
    }

    if (search) {
      qb.andWhere(
        `(category.name ILIKE :search OR category.display_name ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    return qb.getMany();
  }

  async getStats() {
    return this.createQueryBuilder('category')
      .select('category.type', 'type')
      .addSelect(
        `CASE WHEN category.user_id IS NULL THEN 'system' ELSE 'user' END`,
        'owner',
      )
      .addSelect('COUNT(category.id)', 'count')
      .groupBy('category.type')
      .addGroupBy('owner')
      .getRawMany();
  }

  async saveMany(data: Partial<Category>[]) {
    const entities = this.create(data);
    return this.save(entities);
  }
}
