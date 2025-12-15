import { Injectable } from '@nestjs/common';
import { TagGroup } from '../entity/tag-group.entity';

@Injectable()
export class TagGroupsTransformer {
  toResponse(group: TagGroup) {
    return {
      id: group.id,
      name: group.name,
      displayName: group.displayName,
      description: group.description,
      icon: group.icon,
      isSystem: group.isSystem,
      isDeleted: group.isDeleted,
      deletedAt: group.deletedAt?.toISOString() || null,
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
    };
  }

  toListResponse(groups: TagGroup[]) {
    return groups.map((group) => ({
      id: group.id,
      name: group.name,
      displayName: group.displayName,
      description: group.description,
      icon: group.icon,
      isSystem: group.isSystem,
      isDeleted: group.isDeleted,
      deletedAt: group.deletedAt?.toISOString() || null,
    }));
  }
}
