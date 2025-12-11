import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { TagsRepository } from '../repository/tags.repository';
import { TagGroupsRepository } from '../repository/tag-groups.repository';
import { CreateTagDto, UpdateTagDto } from '../dto/shared.dto';
import { Tag } from '../entity/tag.entity';
import { validateSnakeCase } from 'src/common/utils/string.util';

@Injectable()
export class TagsValidator {
  constructor(
    private tagsRepo: TagsRepository,
    private groupsRepo: TagGroupsRepository,
  ) {}

  /** Validate creation of a tag */
  async validateCreate(dto: CreateTagDto, userId: number) {
    const exists = await this.tagsRepo.findAll({ q: dto.name }, userId);
    if (exists.find((tag) => tag.name === dto.name)) {
      throw new BadRequestException('Tag name must be unique.');
    }

    try {
      validateSnakeCase(dto.name, 'Tag name');
    } catch (err) {
      throw new BadRequestException(err.message);
    }

    if (dto.groupId) {
      const group = await this.groupsRepo.findOneById(dto.groupId, userId);
      if (!group) throw new BadRequestException('Tag group does not exist.');
    }
  }

  /** Validate update of a tag */
  async validateUpdate(tag: Tag, dto: UpdateTagDto, userId: number) {
    if (tag.isSystem) {
      throw new ForbiddenException('System tags are immutable.');
    }

    if (dto.name) {
      try {
        validateSnakeCase(dto.name, 'Tag name');
      } catch (err) {
        throw new BadRequestException(err.message);
      }

      const exists = await this.tagsRepo.findAll({ q: dto.name }, userId);
      if (exists.find((t) => t.name === dto.name && t.id !== tag.id)) {
        throw new BadRequestException('Tag name must be unique.');
      }
    }

    if (dto.groupId) {
      const group = await this.groupsRepo.findOneById(dto.groupId, userId);
      if (!group) throw new BadRequestException('Tag group does not exist.');
    }
  }

  /** Validate soft deletion of a tag */
  async validateDelete(tag: Tag, userId: number) {
    if (tag.isSystem) {
      throw new ForbiddenException('Cannot delete system tag.');
    }

    if (tag.userId !== userId) {
      throw new ForbiddenException('You are not allowed to delete this tag.');
    }

    if (tag.isDeleted) {
      throw new BadRequestException('Tag is already soft-deleted.');
    }
  }

  /** Validate restore of a soft-deleted tag */
  async validateRestore(tag: Tag, userId: number) {
    if (!tag) {
      throw new BadRequestException('Tag does not exist.');
    }

    if (tag.userId !== userId && !tag.isSystem) {
      throw new ForbiddenException('You are not allowed to restore this tag.');
    }

    if (!tag.isDeleted || !tag.deletedAt) {
      throw new BadRequestException('This tag is not deleted.');
    }
  }

  /** Validate hard deletion of a tag */
  async validateForceDelete(tag: Tag, userId: number) {
    if (tag.isSystem) {
      throw new ForbiddenException('Cannot force-delete system tag.');
    }

    if (tag.userId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to permanently delete this tag.',
      );
    }

    if (!tag.isDeleted) {
      throw new BadRequestException(
        'Tag must be soft-deleted before permanent deletion.',
      );
    }
  }
}
