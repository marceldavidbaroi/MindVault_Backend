import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountType } from './account_types.entity';

@Injectable()
export class AccountTypeSeeder implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(AccountType)
    private readonly accountTypeRepo: Repository<AccountType>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.accountTypeRepo.count();

    if (count === 0) {
      const defaultAccountTypes: Partial<AccountType>[] = [
        // 🏦 Personal Financial Account Types
        // 1. Liquid & Checking Accounts
        {
          name: 'Checking',
          slug: 'checking',
          is_group: false,
          is_goal: false,
          description: 'Primary personal checking account',
          is_active: true,
        },
        {
          name: 'Joint Checking',
          slug: 'joint_checking',
          is_group: true,
          is_goal: false,
          description: 'Shared checking account',
          is_active: true,
        },
        {
          name: 'Money Market Account',
          slug: 'money_market_account',
          is_group: false,
          is_goal: false,
          description: 'Money market account (MMA)',
          is_active: true,
        },
        {
          name: 'Cash',
          slug: 'cash',
          is_group: false,
          is_goal: false,
          description: 'Physical cash account',
          is_active: true,
        },

        // 2. Savings & Reserve Accounts
        {
          name: 'Savings Account',
          slug: 'savings_account',
          is_group: false,
          is_goal: false,
          description: 'General savings account',
          is_active: true,
        },
        {
          name: 'Certificate of Deposit',
          slug: 'certificate_of_deposit',
          is_group: false,
          is_goal: false,
          description: 'Fixed deposit account',
          is_active: true,
        },
        {
          name: 'High-Yield Savings',
          slug: 'high_yield_savings',
          is_group: false,
          is_goal: false,
          description: 'High interest savings account',
          is_active: true,
        },
        {
          name: 'Goal / Earmarked Savings',
          slug: 'goal_earmarked_savings',
          is_group: false,
          is_goal: true,
          description: 'Savings account with a specific goal',
          is_active: true,
        },

        // 3. Credit & Debt Accounts
        {
          name: 'Credit Card',
          slug: 'credit_card',
          is_group: false,
          is_goal: false,
          description: 'Personal credit card account',
          is_active: true,
        },
        {
          name: 'Personal Loan',
          slug: 'personal_loan',
          is_group: false,
          is_goal: false,
          description: 'Personal loan account',
          is_active: true,
        },
        {
          name: 'Mortgage',
          slug: 'mortgage',
          is_group: false,
          is_goal: false,
          description: 'Mortgage loan account',
          is_active: true,
        },
        {
          name: 'Car Loan',
          slug: 'car_loan',
          is_group: false,
          is_goal: false,
          description: 'Car loan account',
          is_active: true,
        },
        {
          name: 'Student Loan',
          slug: 'student_loan',
          is_group: false,
          is_goal: false,
          description: 'Student loan account',
          is_active: true,
        },
        {
          name: 'Line of Credit',
          slug: 'line_of_credit',
          is_group: false,
          is_goal: false,
          description: 'Personal line of credit (LOC)',
          is_active: true,
        },

        // 4. Investment Accounts
        {
          name: 'Brokerage Account',
          slug: 'brokerage_account',
          is_group: false,
          is_goal: false,
          description: 'Taxable investment account',
          is_active: true,
        },
        {
          name: 'Retirement Account',
          slug: 'retirement_account',
          is_group: false,
          is_goal: false,
          description:
            'Retirement savings account (401k, IRA, Roth IRA, Pension)',
          is_active: true,
        },
        {
          name: 'Health Savings Account',
          slug: 'health_savings_account',
          is_group: false,
          is_goal: false,
          description: 'Tax-advantaged health account (HSA)',
          is_active: true,
        },
        {
          name: 'Custodial Account',
          slug: 'custodial_account',
          is_group: false,
          is_goal: false,
          description: 'Custodial account (UTMA/UGMA)',
          is_active: true,
        },

        // 🏢 Shared / Business Entity Account Types
        // 5. Business & Corporate Accounts
        {
          name: 'Business Checking',
          slug: 'business_checking',
          is_group: true,
          is_goal: false,
          description: 'Business operating account',
          is_active: true,
        },
        {
          name: 'Payroll Account',
          slug: 'payroll_account',
          is_group: true,
          is_goal: false,
          description: 'Business payroll account',
          is_active: true,
        },
        {
          name: 'Petty Cash',
          slug: 'petty_cash',
          is_group: true,
          is_goal: false,
          description: 'Small cash fund for business expenses',
          is_active: true,
        },
        {
          name: 'Accounts Receivable',
          slug: 'accounts_receivable',
          is_group: true,
          is_goal: false,
          description: 'Money owed to the business',
          is_active: true,
        },
        {
          name: 'Accounts Payable',
          slug: 'accounts_payable',
          is_group: true,
          is_goal: false,
          description: 'Money the business owes',
          is_active: true,
        },

        // 6. Shared / Group Entity Accounts
        {
          name: 'Family Budget Account',
          slug: 'family_budget_account',
          is_group: true,
          is_goal: false,
          description: 'Shared family budget account',
          is_active: true,
        },
        {
          name: 'Partnership Account',
          slug: 'partnership_account',
          is_group: true,
          is_goal: false,
          description: 'Shared partnership account',
          is_active: true,
        },
        {
          name: 'Club / Association Treasury',
          slug: 'club_association_treasury',
          is_group: true,
          is_goal: false,
          description: 'Treasury account for clubs or associations',
          is_active: true,
        },
      ].map((c) => ({ ...c, user: null })); // system account types

      await this.accountTypeRepo.save(defaultAccountTypes);

      console.log('AccountTypes table seeded successfully.');
    }
  }
}
