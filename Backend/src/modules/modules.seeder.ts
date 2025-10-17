import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ModuleEntity } from './modules.entity';

@Injectable()
export class ModuleSeeder implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(ModuleEntity)
    private readonly moduleRepo: Repository<ModuleEntity>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.moduleRepo.count();

    if (count === 0) {
      await this.moduleRepo.save([
        // parent modules
        {
          name: 'auth',
          parentModule: null,
          description: '',
        },
        {
          name: 'finance',
          parentModule: null,
          description: '',
        },
        {
          name: 'linklog',
          parentModule: null,
          description: '',
        },
        {
          name: 'modules',
          parentModule: null,
          description: '',
        },

        //transactions module
        {
          name: 'transactions',
          parentModule: 'finance',
          description: '',
        },
        {
          name: 'budgets',
          parentModule: 'finance',
          description: '',
        },
        {
          name: 'reports',
          parentModule: 'finance',
          description: '',
        },
        {
          name: 'savings-goals',
          parentModule: 'finance',
          description: '',
        },
        {
          name: 'finance-dashboard',
          parentModule: 'finance',
          description: '',
        },

        //linklog module
        {
          name: 'contacts',
          parentModule: 'linklog',
          description: 'Contacts module under LinkLog',
        },
        {
          name: 'capsule',
          parentModule: 'linklog',
          description: 'Capsule module under LinkLog',
        },
        {
          name: 'storyline',
          parentModule: 'linklog',
          description: 'Storyline module under LinkLog',
        },
        {
          name: 'micro-actions',
          parentModule: 'linklog',
          description: '',
        },
      ]);

      console.log('Modules table seeded successfully.');
    }
  }
}
