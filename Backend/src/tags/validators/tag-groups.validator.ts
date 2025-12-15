import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { TagGroupsRepository } from '../repository/tag-groups.repository';
import { TagsRepository } from '../repository/tags.repository';
import { CreateTagGroupDto, UpdateTagGroupDto } from '../dto/shared.dto';
import { TagGroup } from '../entity/tag-group.entity';
import { validateSnakeCase } from 'src/common/utils/string.util';

@Injectable()
export class TagGroupsValidator {
  constructor(
    private groupsRepo: TagGroupsRepository,
    private tagsRepo: TagsRepository,
  ) {}

  /** Validate creation of a tag group */
  async validateCreate(dto: CreateTagGroupDto, userId: number) {
    const exists = await this.groupsRepo.findAll({ q: dto.name }, userId);
    if (exists.find((g) => g.name === dto.name)) {
      throw new BadRequestException('Tag group name must be unique.');
    }

    try {
      validateSnakeCase(dto.name, 'Tag group name');
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  /** Validate update of a tag group */
  async validateUpdate(
    group: TagGroup,
    dto: UpdateTagGroupDto,
    userId: number,
  ) {
    if (group.isSystem) {
      throw new ForbiddenException('Cannot modify system tag group.');
    }

    if (group.userId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to update this tag group.',
      );
    }

    if (dto.name) {
      try {
        validateSnakeCase(dto.name, 'Tag group name');
      } catch (err) {
        throw new BadRequestException(err.message);
      }

      const exists = await this.groupsRepo.findAll({ q: dto.name }, userId);
      if (exists.find((g) => g.name === dto.name && g.id !== group.id)) {
        throw new BadRequestException('Tag group name must be unique.');
      }
    }
  }

  /** Validate soft deletion of a tag group */
  async validateDelete(group: TagGroup, userId: number) {
    if (group.isSystem) {
      throw new ForbiddenException('Cannot delete system tag group.');
    }

    if (group.userId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this tag group.',
      );
    }

    // Prevent multiple soft deletes
    if (group.isDeleted) {
      throw new BadRequestException('Tag group is already soft-deleted.');
    }

    const tags = await this.tagsRepo.findAll(
      { groupId: group.id },
      group.userId || 0,
    );
    if (tags.length > 0) {
      throw new BadRequestException('Cannot delete group with assigned tags.');
    }
  }

  /** Validate restore of a soft-deleted tag group */
  async validateRestore(group: TagGroup, userId: number) {
    if (!group) {
      throw new BadRequestException('Tag group does not exist.');
    }

    if (group.userId !== userId && !group.isSystem) {
      throw new ForbiddenException(
        'You are not allowed to restore this tag group.',
      );
    }

    if (!group.isDeleted || !group.deletedAt) {
      throw new BadRequestException('This tag group is not deleted.');
    }
  }

  /** Validate hard deletion of a tag group */
  async validateForceDelete(group: TagGroup, userId: number) {
    if (group.isSystem) {
      throw new ForbiddenException('Cannot delete system tag group.');
    }

    if (group.userId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to permanently delete this tag group.',
      );
    }

    // Must be soft-deleted first
    if (!group.isDeleted) {
      throw new BadRequestException(
        'Tag group must be soft-deleted before permanent deletion.',
      );
    }
  }
}
