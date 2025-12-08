import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { TagGroupsRepository } from '../repository/tag-groups.repository';
import { defaultTagGroups } from '../data/default-tag-groups';

@Injectable()
export class TagGroupSeeder {
  constructor(private readonly tagGroupRepo: TagGroupsRepository) {}

  @Command({ command: 'tag-group:seed', describe: 'Seed default tag groups' })
  async seed() {
    await this.tagGroupRepo.truncate();
    await this.tagGroupRepo.saveMany(defaultTagGroups);
    console.log('✅ Default tag groups seeded!');
  }
}
