// src/finance/accounts/data/account-type.data.ts
import { AccountScope } from '../entity/account-type.entity';

export const defaultAccountTypes = [
  {
    name: 'Checking Account',
    description: 'Primary personal spending account',
    scope: AccountScope.PERSONAL,
  },
  {
    name: 'Savings Account',
    description: 'Personal account for saving and emergency funds',
    scope: AccountScope.PERSONAL,
  },
  {
    name: 'Cash Wallet',
    description: 'Tracks physical cash held',
    scope: AccountScope.PERSONAL,
  },
  {
    name: 'Credit Card',
    description: 'Personal credit line for purchases and payments',
    scope: AccountScope.PERSONAL,
  },
  {
    name: 'Loan Account',
    description: 'Tracks personal loans such as student or car loans',
    scope: AccountScope.PERSONAL,
  },
  {
    name: 'Business Checking',
    description: 'Primary business operating account for expenses and income',
    scope: AccountScope.BUSINESS,
  },
  {
    name: 'Business Savings',
    description: 'Business reserve or emergency fund account',
    scope: AccountScope.BUSINESS,
  },
  {
    name: 'Business Credit Card',
    description: 'Business line of credit for expenses and purchases',
    scope: AccountScope.BUSINESS,
  },
  {
    name: 'Payroll Account',
    description: 'Used for employee salaries, taxes, and related payments',
    scope: AccountScope.BUSINESS,
  },
  {
    name: 'Tax Account',
    description: 'Funds set aside for business tax purposes',
    scope: AccountScope.BUSINESS,
  },
  {
    name: 'Joint Checking',
    description: 'Shared account for household expenses',
    scope: AccountScope.FAMILY,
  },
  {
    name: 'Family Savings',
    description: 'Shared savings (e.g., vacation, emergency fund)',
    scope: AccountScope.FAMILY,
  },
  {
    name: 'Household Budget',
    description: 'Tracks shared household money and expenses',
    scope: AccountScope.FAMILY,
  },
  {
    name: 'Kids Allowance Account',
    description: 'Account for managing children’s allowance and expenses',
    scope: AccountScope.FAMILY,
  },
  {
    name: 'Shared Expense Fund',
    description: 'Money pooled by a group for managing shared expenses',
    scope: AccountScope.SHARED,
  },
  {
    name: 'Event Fund',
    description: 'Account for managing shared event expenses',
    scope: AccountScope.SHARED,
  },
];
