import { Category, CategoryType, CategoryScope } from './categories.entity';

export const defaultCategories: Partial<Category>[] = [
  // ---------------- Global Income ----------------
  {
    name: 'salary',
    displayName: 'Salary',
    type: CategoryType.INCOME,
    scope: CategoryScope.GLOBAL,
  },
  {
    name: 'freelance',
    displayName: 'Freelance',
    type: CategoryType.INCOME,
    scope: CategoryScope.GLOBAL,
  },
  {
    name: 'investment',
    displayName: 'Investment',
    type: CategoryType.INCOME,
    scope: CategoryScope.GLOBAL,
  },
  {
    name: 'gift_received',
    displayName: 'Gift Received',
    type: CategoryType.INCOME,
    scope: CategoryScope.GLOBAL,
  },

  // ---------------- Global Expenses ----------------
  {
    name: 'food',
    displayName: 'Food',
    type: CategoryType.EXPENSE,
    scope: CategoryScope.GLOBAL,
  },
  {
    name: 'transport',
    displayName: 'Transport',
    type: CategoryType.EXPENSE,
    scope: CategoryScope.GLOBAL,
  },
  {
    name: 'utilities',
    displayName: 'Utilities',
    type: CategoryType.EXPENSE,
    scope: CategoryScope.GLOBAL,
  },
  {
    name: 'entertainment',
    displayName: 'Entertainment',
    type: CategoryType.EXPENSE,
    scope: CategoryScope.GLOBAL,
  },
  {
    name: 'healthcare',
    displayName: 'Healthcare',
    type: CategoryType.EXPENSE,
    scope: CategoryScope.GLOBAL,
  },
  {
    name: 'education',
    displayName: 'Education',
    type: CategoryType.EXPENSE,
    scope: CategoryScope.GLOBAL,
  },
  {
    name: 'travel',
    displayName: 'Travel',
    type: CategoryType.EXPENSE,
    scope: CategoryScope.GLOBAL, // can apply to family, business, or global trips
  },

  // ---------------- Business Income ----------------
  {
    name: 'client_payment',
    displayName: 'Client Payment',
    type: CategoryType.INCOME,
    scope: CategoryScope.BUSINESS,
  },
  {
    name: 'project_bonus',
    displayName: 'Project Bonus',
    type: CategoryType.INCOME,
    scope: CategoryScope.BUSINESS,
  },

  // ---------------- Business Expenses ----------------
  {
    name: 'office_rent',
    displayName: 'Office Rent',
    type: CategoryType.EXPENSE,
    scope: CategoryScope.BUSINESS,
  },
  {
    name: 'supplies',
    displayName: 'Supplies',
    type: CategoryType.EXPENSE,
    scope: CategoryScope.BUSINESS,
  },
  {
    name: 'software_subscription',
    displayName: 'Software Subscription',
    type: CategoryType.EXPENSE,
    scope: CategoryScope.BUSINESS,
  },
  {
    name: 'employee_salary',
    displayName: 'Employee Salary',
    type: CategoryType.EXPENSE,
    scope: CategoryScope.BUSINESS,
  },
  {
    name: 'marketing',
    displayName: 'Marketing',
    type: CategoryType.EXPENSE,
    scope: CategoryScope.BUSINESS,
  },

  // ---------------- Family Income ----------------
  {
    name: 'family_allowance',
    displayName: 'Family Allowance',
    type: CategoryType.INCOME,
    scope: CategoryScope.FAMILY,
  },
  {
    name: 'rental_income',
    displayName: 'Rental Income',
    type: CategoryType.INCOME,
    scope: CategoryScope.FAMILY,
  },

  // ---------------- Family Expenses ----------------
  {
    name: 'groceries',
    displayName: 'Groceries',
    type: CategoryType.EXPENSE,
    scope: CategoryScope.FAMILY,
  },
  {
    name: 'school_fees',
    displayName: 'School Fees',
    type: CategoryType.EXPENSE,
    scope: CategoryScope.FAMILY,
  },
  {
    name: 'medical_bills',
    displayName: 'Medical Bills',
    type: CategoryType.EXPENSE,
    scope: CategoryScope.FAMILY,
  },
  {
    name: 'house_maintenance',
    displayName: 'House Maintenance',
    type: CategoryType.EXPENSE,
    scope: CategoryScope.FAMILY,
  },
  {
    name: 'hobby',
    displayName: 'Hobby',
    type: CategoryType.EXPENSE,
    scope: CategoryScope.FAMILY, // moved from individual to family/global
  },
  {
    name: 'dining_out',
    displayName: 'Dining Out',
    type: CategoryType.EXPENSE,
    scope: CategoryScope.FAMILY,
  },
  {
    name: 'shopping',
    displayName: 'Shopping',
    type: CategoryType.EXPENSE,
    scope: CategoryScope.FAMILY,
  },
  {
    name: 'gym',
    displayName: 'Gym',
    type: CategoryType.EXPENSE,
    scope: CategoryScope.FAMILY,
  },
];
