import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Tag } from '../entity/tag.entity';
import { QueryTagDto } from '../dto/shared.dto';

@Injectable()
export class TagsRepository {
  private repo: Repository<Tag>;

  constructor(private dataSource: DataSource) {
    this.repo = this.dataSource.getRepository(Tag);
  }

  async findAll(
    query: QueryTagDto,
    userId: number,
    relations: string[] = [], // dynamic relations
  ): Promise<Tag[]> {
    const qb = this.repo.createQueryBuilder('tag');

    // Search query
    if (query.q) {
      qb.andWhere('(tag.displayName ILIKE :q OR tag.name ILIKE :q)', {
        q: `%${query.q}%`,
      });
    }

    // Filter by group
    if (query.groupId) {
      qb.andWhere('tag.groupId = :groupId', { groupId: query.groupId });
    }

    // Exclude system tags if not requested
    if (!query.includeSystem) {
      qb.andWhere('tag.isSystem = false');
    }

    // Soft-deleted filter
    if (query.onlyDeleted) {
      qb.andWhere('tag.isDeleted = true'); // Only soft-deleted
    } else if (!query.includeDeleted) {
      qb.andWhere('tag.isDeleted = false'); // Exclude soft-deleted
    }

    // User-specific tags or system tags
    qb.andWhere('(tag.userId = :userId OR tag.isSystem = true)', { userId });

    // Pagination
    if (query.limit) qb.take(query.limit);
    if (query.page && query.limit) qb.skip((query.page - 1) * query.limit);

    // Dynamically join relations
    relations.forEach((relation) => {
      qb.leftJoinAndSelect(`tag.${relation}`, relation);
    });

    return qb.getMany();
  }

  async findOneById(id: number, userId: number): Promise<Tag> {
    const tag = await this.repo.findOne({
      where: [
        { id, userId },
        { id, isSystem: true },
      ],
      relations: ['group'], // always join the group
    });

    if (!tag) throw new NotFoundException('Tag not found.');
    return tag;
  }

  async createTag(payload: Partial<Tag>): Promise<Tag> {
    const tag = this.repo.create(payload);
    return this.repo.save(tag);
  }

  async updateTag(id: number, payload: Partial<Tag>): Promise<Tag> {
    await this.repo.update(id, payload);
    return this.repo.findOneOrFail({ where: { id } });
  }

  async softDelete(id: number, userId: number): Promise<void> {
    await this.repo.update(id, { isDeleted: true, deletedAt: new Date() });
  }

  async restore(id: number, userId: number): Promise<void> {
    await this.repo.update(id, { isDeleted: false, deletedAt: undefined });
  }

  async hardDelete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async truncate(): Promise<void> {
    await this.repo.query('TRUNCATE TABLE tags RESTART IDENTITY CASCADE;');
  }

  async saveMany(tags: Partial<Tag>[]): Promise<Tag[]> {
    const tagEntities = this.repo.create(tags);
    return this.repo.save(tagEntities);
  }
}
