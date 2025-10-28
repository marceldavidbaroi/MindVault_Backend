import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from './user-roles.entity';

@Injectable()
export class UserRoleSeeder implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(UserRole)
    private readonly roleRepo: Repository<UserRole>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.roleRepo.count();

    if (count === 0) {
      const roles: {
        name: string;
        permissions: Record<string, boolean>;
        description: string;
      }[] = [
        {
          name: 'owner',
          permissions: {
            'accounts:create': true,
            'accounts:update': true,
            'accounts:delete': true,
            'transactions:create': true,
            'transactions:approve': true,
            'users:invite': true,
            'settings:manage': true,
          },
          description:
            'Full access to all resources and management permissions.',
        },
        {
          name: 'admin',
          permissions: {
            'accounts:create': true,
            'accounts:update': true,
            'accounts:delete': false,
            'transactions:create': true,
            'transactions:approve': true,
            'users:invite': false,
            'settings:manage': true,
          },
          description:
            'Can manage most resources but cannot delete accounts or invite users.',
        },
        {
          name: 'editor',
          permissions: {
            'accounts:create': true,
            'accounts:update': true,
            'accounts:delete': false,
            'transactions:create': true,
            'transactions:approve': false,
            'settings:manage': false,
          },
          description:
            'Can create and edit transactions but cannot manage users or settings.',
        },
        {
          name: 'viewer',
          permissions: {
            'accounts:view': true,
            'transactions:view': true,
            'settings:manage': false,
          },
          description: 'Read-only access for reporting or monitoring purposes.',
        },
      ];

      await this.roleRepo.save(roles);

      console.log('UserRoles table seeded successfully.');
    }
  }
}
