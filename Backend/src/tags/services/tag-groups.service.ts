import { Injectable, ForbiddenException } from '@nestjs/common';
import { TagGroupsRepository } from '../repository/tag-groups.repository';
import { TagGroupsValidator } from '../validators/tag-groups.validator';
import { TagGroupsTransformer } from '../transformers/tag-groups.transformer';
import {
  CreateTagGroupDto,
  UpdateTagGroupDto,
  QueryTagGroupDto,
} from '../dto/shared.dto';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class TagGroupsService {
  constructor(
    private readonly groupsRepo: TagGroupsRepository,
    private readonly validator: TagGroupsValidator,
    private readonly transformer: TagGroupsTransformer,
  ) {}

  /** Create a new tag group with prefixed name before validation */
  async createGroup(user: User, dto: CreateTagGroupDto) {
    // Add prefix to the name first
    const prefixedName = `${user.username.toLowerCase()}_${dto.name}`;

    // Create a new DTO object with the prefixed name for validation
    const prefixedDto = { ...dto, name: prefixedName };

    // Validate using the prefixed name
    await this.validator.validateCreate(prefixedDto, user.id);

    const group = await this.groupsRepo.createGroup({
      ...prefixedDto,
      userId: user.id,
      isSystem: false,
    });

    return {
      success: true,
      message: 'Tag group created successfully',
      data: this.transformer.toResponse(group),
    };
  }

  /** Update an existing tag group */
  async updateGroup(id: number, user: User, dto: UpdateTagGroupDto) {
    const group = await this.groupsRepo.findOneById(id, user.id);
    await this.validator.validateUpdate(group, dto, user.id);

    const updated = await this.groupsRepo.updateGroup(id, dto);

    return {
      success: true,
      message: 'Tag group updated successfully',
      data: this.transformer.toResponse(updated),
    };
  }

  /** Get all tag groups for a user with filters */
  async getAllGroups(user: User, query: QueryTagGroupDto) {
    const groups = await this.groupsRepo.findAll(query, user.id);
    return {
      success: true,
      message: 'Tag groups fetched successfully',
      data: this.transformer.toListResponse(groups),
    };
  }

  /** Get a single tag group */
  async getOneGroup(id: number, user: User) {
    const group = await this.groupsRepo.findOneById(id, user.id);
    return {
      success: true,
      message: 'Tag group fetched successfully',
      data: this.transformer.toResponse(group),
    };
  }

  async deleteGroup(id: number, user: User) {
    const group = await this.groupsRepo.findOneById(id, user.id);
    await this.validator.validateDelete(group, user.id);
    await this.groupsRepo.softDelete(id);
    return {
      success: true,
      message: 'Tag group soft-deleted successfully',
      data: null,
    };
  }

  async forceDeleteGroup(id: number, user: User) {
    const group = await this.groupsRepo.findOneById(id, user.id);
    await this.validator.validateForceDelete(group, user.id);
    await this.groupsRepo.hardDelete(id);
    return {
      success: true,
      message: 'Tag group permanently deleted',
      data: null,
    };
  }

  /** Restore a soft-deleted tag group */
  async restoreGroup(id: number, user: User) {
    const group = await this.groupsRepo.findOneById(id, user.id);

    // Validate before restoring
    await this.validator.validateRestore(group, user.id);

    await this.groupsRepo.restore(id);

    return {
      success: true,
      message: 'Tag group restored successfully',
      data: null,
    };
  }
}
