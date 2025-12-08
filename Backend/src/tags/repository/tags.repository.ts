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

  async findAll(query: QueryTagDto, userId: number): Promise<Tag[]> {
    const qb = this.repo.createQueryBuilder('tag');

    if (query.q) {
      qb.andWhere('(tag.displayName ILIKE :q OR tag.name ILIKE :q)', {
        q: `%${query.q}%`,
      });
    }

    if (query.groupId) {
      qb.andWhere('tag.groupId = :groupId', { groupId: query.groupId });
    }

    if (!query.includeSystem) {
      qb.andWhere('tag.isSystem = false');
    }

    if (!query.includeDeleted) {
      qb.andWhere('tag.isDeleted = false');
    }

    qb.andWhere('(tag.userId = :userId OR tag.isSystem = true)', { userId });

    if (query.limit) qb.take(query.limit);
    if (query.page) qb.skip((query.page - 1) * (query.limit || 0));

    return qb.getMany();
  }

  async findOneById(id: number, userId: number): Promise<Tag> {
    const tag = await this.repo.findOne({
      where: [
        { id, userId },
        { id, isSystem: true },
      ],
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
