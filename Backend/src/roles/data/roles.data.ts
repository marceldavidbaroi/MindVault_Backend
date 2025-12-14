import { Role } from '../entity/role.entity';

export const defaultRoles: Partial<Role>[] = [
  {
    name: 'owner',
    displayName: 'Owner',
    description: 'Full access to everything',
    isSystem: true,
  },
  {
    name: 'admin',
    displayName: 'Admin',
    description: 'Admin privileges',
    isSystem: true,
  },
  {
    name: 'editor',
    displayName: 'Editor',
    description: 'Can edit content',
    isSystem: true,
  },
  {
    name: 'viewer',
    displayName: 'Viewer',
    description: 'Read-only access',
    isSystem: true,
  },
];
