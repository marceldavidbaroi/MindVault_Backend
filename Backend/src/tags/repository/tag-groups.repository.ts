import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TagGroup } from '../entity/tag-group.entity';
import { QueryTagGroupDto } from '../dto/shared.dto';

@Injectable()
export class TagGroupsRepository {
  private repo: Repository<TagGroup>;

  constructor(private dataSource: DataSource) {
    // Initialize the repository for TagGroup entity
    this.repo = this.dataSource.getRepository(TagGroup);
  }

  /**
   * Get all tag groups for a user with optional filtering and pagination
   */
  async findAll(query: QueryTagGroupDto, userId: number): Promise<TagGroup[]> {
    const qb = this.repo.createQueryBuilder('group');

    if (query.q) {
      qb.andWhere('(group.displayName ILIKE :q OR group.name ILIKE :q)', {
        q: `%${query.q}%`,
      });
    }

    // System groups filter
    if (!query.includeSystem) {
      qb.andWhere('group.isSystem = false');
    }

    // Soft-deleted filter
    if (query.onlyDeleted) {
      qb.andWhere('group.isDeleted = true'); // Only soft-deleted
    } else if (!query.includeDeleted) {
      qb.andWhere('group.isDeleted = false'); // Exclude soft-deleted
    }

    // User filter
    qb.andWhere('(group.userId = :userId OR group.isSystem = true)', {
      userId,
    });

    // Pagination
    if (query.limit) qb.take(query.limit);
    if (query.page && query.limit) qb.skip((query.page - 1) * query.limit);

    return qb.getMany();
  }

  /**
   * Get a single tag group by ID
   */
  async findOneById(id: number, userId: number): Promise<TagGroup> {
    const group = await this.repo.findOne({
      where: [
        { id, userId }, // User-owned group
        { id, isSystem: true }, // System group
      ],
    });

    if (!group) throw new NotFoundException('Tag group not found.');
    return group;
  }

  /**
   * Create a new tag group
   */
  async createGroup(payload: Partial<TagGroup>): Promise<TagGroup> {
    const group = this.repo.create(payload);
    return this.repo.save(group);
  }

  /**
   * Update an existing tag group
   */
  async updateGroup(id: number, payload: Partial<TagGroup>): Promise<TagGroup> {
    await this.repo.update(id, payload);
    const updated = await this.repo.findOneBy({ id });
    if (!updated)
      throw new NotFoundException('Tag group not found after update.');
    return updated;
  }

  /**
   * Soft delete a tag group
   */
  async softDelete(id: number): Promise<void> {
    await this.repo.update(id, { isDeleted: true, deletedAt: new Date() });
  }

  /**
   * Restore a soft-deleted tag group
   */
  async restore(id: number): Promise<void> {
    await this.repo.update(id, { isDeleted: false, deletedAt: undefined });
  }

  /**
   * Permanently delete a tag group
   */
  async hardDelete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async saveMany(groups: Partial<TagGroup>[]) {
    return this.repo.save(groups);
  }

  async truncate() {
    await this.repo.query('TRUNCATE TABLE tag_groups CASCADE;');
  }
}
