import { TagGroup } from '../entity/tag-group.entity';

export const defaultTagGroups: Partial<TagGroup>[] = [
  {
    name: 'personal_important',
    displayName: 'Personal Important',
    description: 'Tags for critical personal items or priorities',
    icon: 'star',
    isSystem: true,
  },
  {
    name: 'work_urgent',
    displayName: 'Work Urgent',
    description: 'Tags for urgent tasks or deadlines at work',
    icon: 'alert-circle',
    isSystem: true,
  },
  {
    name: 'finance',
    displayName: 'Finance',
    description:
      'Tags for financial records, transactions, budgets, and accounts',
    icon: 'credit-card',
    isSystem: true,
  },
  {
    name: 'health',
    displayName: 'Health & Wellness',
    description:
      'Tags related to physical and mental health, fitness, and wellness',
    icon: 'heart',
    isSystem: true,
  },
  {
    name: 'learning',
    displayName: 'Learning & Knowledge',
    description: 'Tags for notes, courses, resources, and knowledge tracking',
    icon: 'book',
    isSystem: true,
  },
  {
    name: 'project',
    displayName: 'Project',
    description: 'Tags for work or personal projects, tasks, and milestones',
    icon: 'briefcase',
    isSystem: true,
  },
  {
    name: 'contacts',
    displayName: 'Contacts',
    description: 'Tags for people, networking, and social interactions',
    icon: 'users',
    isSystem: true,
  },
  {
    name: 'reflection',
    displayName: 'Reflection & Ideas',
    description: 'Tags for thoughts, reflections, journaling, or brainstorming',
    icon: 'lightbulb',
    isSystem: true,
  },
  {
    name: 'capsule',
    displayName: 'Memories & Moments',
    description: 'Tags for personal moments, stories, or captured events',
    icon: 'archive',
    isSystem: true,
  },
  {
    name: 'micro_actions',
    displayName: 'Micro Actions',
    description: 'Tags for small tasks, goals, or habits tracking',
    icon: 'check-circle',
    isSystem: true,
  },
];
