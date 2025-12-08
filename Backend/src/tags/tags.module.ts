import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TagsService } from './services/tags.service';
import { TagsRepository } from './repository/tags.repository';
import { TagGroupsRepository } from './repository/tag-groups.repository';
import { TagsValidator } from './validators/tags.validator';
import { TagsTransformer } from './transformers/tags.transformer';
import { TagGroupsValidator } from './validators/tag-groups.validator';
import { TagGroupsTransformer } from './transformers/tag-groups.transformer';
import { TagsController } from './controller/tags.controller';
import { TagGroupsService } from './services/tag-groups.service';
import { TagGroupsController } from './controller/tag-groups.controller';
import { TagGroupSeeder } from './seeder/tag-groups.seeder';
import { TagSeeder } from './seeder/tag.seeder';

@Module({
  controllers: [TagGroupsController, TagsController],
  providers: [
    TagsService,
    TagGroupsService,
    TagsValidator,
    TagGroupsValidator,
    TagsTransformer,
    TagGroupsTransformer,
    TagGroupSeeder,
    TagSeeder, // Seeder can now inject TagGroupsRepository
    {
      provide: TagsRepository,
      useFactory: (dataSource: DataSource) => new TagsRepository(dataSource),
      inject: [DataSource],
    },
    {
      provide: TagGroupsRepository,
      useFactory: (dataSource: DataSource) =>
        new TagGroupsRepository(dataSource),
      inject: [DataSource],
    },
  ],
  exports: [TagsService, TagGroupsService, TagGroupsRepository],
})
export class TagsModule {}
