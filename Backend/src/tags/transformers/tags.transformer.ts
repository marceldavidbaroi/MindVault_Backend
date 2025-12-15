import { Injectable } from '@nestjs/common';
import { Tag } from '../entity/tag.entity';
import { TagGroup } from '../entity/tag-group.entity';

@Injectable()
export class TagsTransformer {
  toResponse(tag: Tag) {
    return {
      id: tag.id,
      name: tag.name,
      displayName: tag.displayName,
      description: tag.description,
      icon: tag.icon,
      color: tag.color,
      groupId: tag.groupId,
      group: tag.group
        ? {
            id: tag.group.id,
            name: tag.group.name,
            displayName: tag.group.displayName,
          }
        : null,
      isSystem: tag.isSystem,
      isDeleted: tag.isDeleted,
      deletedAt: tag.deletedAt?.toISOString() || null,
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString(),
    };
  }

  toListResponse(tags: Tag[]) {
    return tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      displayName: tag.displayName,
      description: tag.description,
      icon: tag.icon,
      color: tag.color,
      groupId: tag.groupId,
      group: tag.group
        ? {
            id: tag.group.id,
            name: tag.group.name,
            displayName: tag.group.displayName,
          }
        : null,
      isSystem: tag.isSystem,
      isDeleted: tag.isDeleted,
      deletedAt: tag.deletedAt?.toISOString() || null,
    }));
  }
}
