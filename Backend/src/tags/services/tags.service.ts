import { Injectable, ForbiddenException } from '@nestjs/common';
import { TagsRepository } from '../repository/tags.repository';
import { TagsValidator } from '../validators/tags.validator';
import { TagsTransformer } from '../transformers/tags.transformer';
import { CreateTagDto, UpdateTagDto, QueryTagDto } from '../dto/shared.dto';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class TagsService {
  constructor(
    private readonly tagsRepo: TagsRepository,
    private readonly validator: TagsValidator,
    private readonly transformer: TagsTransformer,
  ) {}

  async create(user: User, dto: CreateTagDto) {
    await this.validator.validateCreate(dto, user.id);

    const tag = await this.tagsRepo.createTag({
      ...dto,
      userId: user.id,
      isSystem: false,
    });

    return {
      success: true,
      message: 'Tag created successfully',
      data: this.transformer.toResponse(tag),
    };
  }

  async update(id: number, user: User, dto: UpdateTagDto) {
    const tag = await this.tagsRepo.findOneById(id, user.id);
    await this.validator.validateUpdate(tag, dto, user.id);

    const updated = await this.tagsRepo.updateTag(id, dto);

    return {
      success: true,
      message: 'Tag updated successfully',
      data: this.transformer.toResponse(updated),
    };
  }

  async getAll(user: User, query: QueryTagDto) {
    const tags = await this.tagsRepo.findAll(query, user.id);
    return {
      success: true,
      message: 'Tags fetched successfully',
      data: this.transformer.toListResponse(tags),
    };
  }

  async getOne(id: number, user: User) {
    const tag = await this.tagsRepo.findOneById(id, user.id);
    return {
      success: true,
      message: 'Tag fetched successfully',
      data: this.transformer.toResponse(tag),
    };
  }

  async delete(id: number, user: User) {
    const tag = await this.tagsRepo.findOneById(id, user.id);
    await this.validator.validateDelete(tag, user.id);
    await this.tagsRepo.softDelete(id, user.id);
    return {
      success: true,
      message: 'Tag soft-deleted successfully',
      data: null,
    };
  }

  async restore(id: number, user: User) {
    const tag = await this.tagsRepo.findOneById(id, user.id);
    await this.validator.validateRestore(tag, user.id);
    await this.tagsRepo.restore(id, user.id);
    return { success: true, message: 'Tag restored successfully', data: null };
  }

  async forceDelete(id: number, user: User) {
    const tag = await this.tagsRepo.findOneById(id, user.id);
    await this.validator.validateForceDelete(tag, user.id);
    await this.tagsRepo.hardDelete(id);
    return { success: true, message: 'Tag permanently deleted', data: null };
  }
}
