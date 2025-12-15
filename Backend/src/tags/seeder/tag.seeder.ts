import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { TagsRepository } from '../repository/tags.repository';
import { defaultTags } from '../data/default-tags';

@Injectable()
export class TagSeeder {
  constructor(private readonly tagsRepo: TagsRepository) {}

  @Command({ command: 'tag:seed', describe: 'Seed default tags' })
  async seed() {
    await this.tagsRepo.truncate();
    await this.tagsRepo.saveMany(defaultTags);
    console.log('✅ Default tags seeded!');
  }
}
