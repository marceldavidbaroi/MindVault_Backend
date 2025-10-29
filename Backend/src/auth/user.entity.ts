import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { UserPreferences } from './userPreferences.entity';
import { Transactions } from 'src/finance/transactions/transactions.entity';
import { Budgets } from 'src/finance/budgets/budgets.entity';
import { SavingsGoals } from 'src/finance/savings-goals/savings-goals.entity';
import { Reports } from 'src/finance/reports/reports.entity';
import { Category } from 'src/finance/categories/categories.entity';
import { DailySummary } from 'src/finance/summary/daily_summary.entity';
import { MonthlySummary } from 'src/finance/summary/monthly_summary.entity';
import { MonthlyCategorySummary } from 'src/finance/summary/category_monthly_summary.entity';
import { AccountType } from 'src/finance/account_types/account_types.entity';
import { Account } from 'src/finance/account/account.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  refreshToken?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => UserPreferences, (pref) => pref.user, { cascade: true })
  preferences: UserPreferences;

  @OneToMany(() => Transactions, (transaction) => transaction.creatorUser)
  transactions: Transactions[];

  @OneToMany(() => Budgets, (budget) => budget.user)
  budgets: Budgets[];

  @OneToMany(() => SavingsGoals, (savingsGoal) => savingsGoal.user)
  savingsGoals: SavingsGoals[];

  @OneToMany(() => Reports, (report) => report.user)
  reports: Reports[];

  @OneToMany(() => Category, (categories) => categories.user)
  categories: Category[];

  @OneToMany(() => DailySummary, (daily_summary) => daily_summary.user)
  dailySummaries: DailySummary[];

  @OneToMany(() => MonthlySummary, (monthly_summary) => monthly_summary.user)
  monthlySummaries: MonthlySummary[];

  @OneToMany(
    () => MonthlyCategorySummary,
    (monthly_category_summary) => monthly_category_summary.user,
  )
  monthlyCategorySummaries: MonthlyCategorySummary[];

  @OneToMany(() => AccountType, (account_type) => account_type.user)
  accountTypes: AccountType[];

  @OneToMany(() => Account, (account) => account.ownerUser)
  accounts: AccountType[];
}
