import { Tag } from '../entity/tag.entity';

/**
 * Default tags for MindVault with soft, elegant colors.
 * Colors are hexadecimal for UI consistency and aesthetics.
 */
export const defaultTags: Partial<Tag>[] = [
  // Personal Important
  {
    name: 'urgent_personal',
    displayName: 'Urgent Personal',
    description: 'Critical personal tasks that need immediate attention',
    icon: 'exclamation-circle',
    color: '#FF6B6B', // soft red
    groupId: 1,
    isSystem: true,
  },
  {
    name: 'family',
    displayName: 'Family',
    description: 'Tasks, events, or reminders related to family',
    icon: 'users',
    color: '#FFD93D', // soft yellow
    groupId: 1,
    isSystem: true,
  },
  {
    name: 'self_care',
    displayName: 'Self-Care',
    description: 'Personal health, relaxation, and wellness activities',
    icon: 'smile',
    color: '#6BCB77', // soft green
    groupId: 1,
    isSystem: true,
  },

  // Work Urgent
  {
    name: 'deadline',
    displayName: 'Deadline',
    description: 'Work tasks with strict deadlines',
    icon: 'clock',
    color: '#FF9F1C', // soft orange
    groupId: 2,
    isSystem: true,
  },
  {
    name: 'meeting',
    displayName: 'Meeting',
    description: 'Scheduled meetings or calls',
    icon: 'calendar',
    color: '#4D96FF', // soft blue
    groupId: 2,
    isSystem: true,
  },
  {
    name: 'client_task',
    displayName: 'Client Task',
    description: 'Tasks assigned by clients or external stakeholders',
    icon: 'user-check',
    color: '#845EC2', // soft purple
    groupId: 2,
    isSystem: true,
  },

  // Finance
  {
    name: 'expense',
    displayName: 'Expense',
    description: 'Daily expenses and payments',
    icon: 'dollar-sign',
    color: '#FF6F91', // soft pink
    groupId: 3,
    isSystem: true,
  },
  {
    name: 'income',
    displayName: 'Income',
    description: 'Salary, bonuses, and other income sources',
    icon: 'trending-up',
    color: '#00C9A7', // soft teal
    groupId: 3,
    isSystem: true,
  },
  {
    name: 'savings',
    displayName: 'Savings',
    description: 'Saving goals and account contributions',
    icon: 'piggy-bank',
    color: '#F9F871', // soft gold
    groupId: 3,
    isSystem: true,
  },
  {
    name: 'investment',
    displayName: 'Investment',
    description: 'Investments in stocks, mutual funds, or assets',
    icon: 'bar-chart-2',
    color: '#B5EAEA', // soft aqua
    groupId: 3,
    isSystem: true,
  },

  // Health & Wellness
  {
    name: 'exercise',
    displayName: 'Exercise',
    description: 'Workouts, gym, running, or yoga sessions',
    icon: 'activity',
    color: '#FFABAB', // soft red-pink
    groupId: 4,
    isSystem: true,
  },
  {
    name: 'nutrition',
    displayName: 'Nutrition',
    description: 'Meal planning, diet, and nutrition tracking',
    icon: 'coffee',
    color: '#FFD6A5', // soft peach
    groupId: 4,
    isSystem: true,
  },
  {
    name: 'meditation',
    displayName: 'Meditation',
    description: 'Mindfulness and mental wellness routines',
    icon: 'feather',
    color: '#A0CED9', // soft cyan
    groupId: 4,
    isSystem: true,
  },

  // Learning & Knowledge
  {
    name: 'course',
    displayName: 'Course',
    description: 'Online or offline courses being pursued',
    icon: 'book-open',
    color: '#CDB4DB', // soft lavender
    groupId: 5,
    isSystem: true,
  },
  {
    name: 'reading',
    displayName: 'Reading',
    description: 'Books, articles, or other learning materials',
    icon: 'book',
    color: '#FFDAC1', // soft cream
    groupId: 5,
    isSystem: true,
  },
  {
    name: 'research',
    displayName: 'Research',
    description: 'Research tasks or learning projects',
    icon: 'search',
    color: '#B5EAEA', // soft aqua
    groupId: 5,
    isSystem: true,
  },

  // Project
  {
    name: 'task',
    displayName: 'Task',
    description: 'Individual tasks within a project',
    icon: 'check-square',
    color: '#FFAAA7', // soft coral
    groupId: 6,
    isSystem: true,
  },
  {
    name: 'milestone',
    displayName: 'Milestone',
    description: 'Major project milestones or achievements',
    icon: 'flag',
    color: '#FFD6A5', // soft peach
    groupId: 6,
    isSystem: true,
  },
  {
    name: 'bug',
    displayName: 'Bug',
    description: 'Project issues or bugs to fix',
    icon: 'bug',
    color: '#FF6B6B', // soft red
    groupId: 6,
    isSystem: true,
  },

  // Contacts
  {
    name: 'friend',
    displayName: 'Friend',
    description: 'Close friends and personal contacts',
    icon: 'user-friends',
    color: '#FEC5BB', // soft pink
    groupId: 7,
    isSystem: true,
  },
  {
    name: 'colleague',
    displayName: 'Colleague',
    description: 'Work colleagues and professional contacts',
    icon: 'users',
    color: '#C7CEEA', // soft lavender
    groupId: 7,
    isSystem: true,
  },
  {
    name: 'family_contact',
    displayName: 'Family Contact',
    description: 'Family members for easy tagging',
    icon: 'user',
    color: '#B5EAEA', // soft aqua
    groupId: 7,
    isSystem: true,
  },

  // Reflection & Ideas
  {
    name: 'journal',
    displayName: 'Journal',
    description: 'Personal reflections and journaling',
    icon: 'edit',
    color: '#FFDAC1', // soft cream
    groupId: 8,
    isSystem: true,
  },
  {
    name: 'brainstorm',
    displayName: 'Brainstorm',
    description: 'Creative ideas and thinking sessions',
    icon: 'lightbulb',
    color: '#FFE1A8', // soft yellow
    groupId: 8,
    isSystem: true,
  },
  {
    name: 'notes',
    displayName: 'Notes',
    description: 'Quick notes and ideas capture',
    icon: 'file-text',
    color: '#CDB4DB', // soft lavender
    groupId: 8,
    isSystem: true,
  },

  // Memories & Moments (Capsule)
  {
    name: 'photo',
    displayName: 'Photo',
    description: 'Photographs and visual memories',
    icon: 'image',
    color: '#FFB5A7', // soft coral
    groupId: 9,
    isSystem: true,
  },
  {
    name: 'event',
    displayName: 'Event',
    description: 'Special events or occasions',
    icon: 'calendar',
    color: '#FFD6A5', // soft peach
    groupId: 9,
    isSystem: true,
  },
  {
    name: 'story',
    displayName: 'Story',
    description: 'Stories or anecdotes to preserve',
    icon: 'archive',
    color: '#B5EAEA', // soft aqua
    groupId: 9,
    isSystem: true,
  },

  // Micro Actions
  {
    name: 'habit',
    displayName: 'Habit',
    description: 'Daily or weekly habits to track',
    icon: 'repeat',
    color: '#FFDAC1', // soft cream
    groupId: 10,
    isSystem: true,
  },
  {
    name: 'goal',
    displayName: 'Goal',
    description: 'Small goals or tasks for micro action tracking',
    icon: 'target',
    color: '#FFABAB', // soft red-pink
    groupId: 10,
    isSystem: true,
  },
  {
    name: 'reminder',
    displayName: 'Reminder',
    description: 'Reminders for micro-actions and tasks',
    icon: 'bell',
    color: '#C7CEEA', // soft lavender
    groupId: 10,
    isSystem: true,
  },
];
