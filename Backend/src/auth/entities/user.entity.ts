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
// import { Transactions } from 'src/finance/transactions/transactions.entity';
// import { Budgets } from 'src/finance/budgets/budgets.entity';
// import { SavingsGoals } from 'src/finance/savings-goals/savings-goals.entity';
// import { Reports } from 'src/finance/reports/reports.entity';
// import { Category } from 'src/finance/categories/categories.entity';
// import { DailySummary } from 'src/finance/summary/daily_summary.entity';
// import { MonthlySummary } from 'src/finance/summary/monthly_summary.entity';
// import { MonthlyCategorySummary } from 'src/finance/summary/category_monthly_summary.entity';
// import { AccountType } from 'src/finance/account_types/account_types.entity';
// import { Account } from 'src/finance/account/account.entity';
import { UserSecurityQuestion } from './userSecurityQuestion.entity';
import { PasswordResetLog } from './passwordResetLog.entity';
import { UserSession } from './userSessions.entity';
import { Category } from 'src/finance/categories/categories.entity';
import { Account } from 'src/finance/accounts/entity/account.entity';
import { AccountUserRole } from 'src/finance/accounts/entity/account-user-role.entity';

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

  @Column({ nullable: true })
  passkey?: string;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'passkey_expires_at',
  })
  passkeyExpiresAt?: Date;

  @Column({ type: 'boolean', default: false, name: 'has_security_questions' })
  hasSecurityQuestions: boolean;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;

  // relations

  @OneToMany(() => UserSecurityQuestion, (q) => q.user)
  securityQuestions: UserSecurityQuestion[];

  @OneToMany(() => PasswordResetLog, (log) => log.user)
  passwordResetLogs: PasswordResetLog[];

  @OneToMany(() => UserSession, (session) => session.user)
  sessions: UserSession[];

  @OneToOne(() => UserPreferences, (pref) => pref.user, { cascade: true })
  preferences: UserPreferences;

  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];
  @OneToMany(() => Account, (account) => account.owner)
  accounts: Account[];

  @OneToMany(() => AccountUserRole, (accountRole) => accountRole.user)
  accountRoles: AccountUserRole[];

  // @OneToMany(() => Transactions, (transaction) => transaction.creatorUser)
  // transactions: Transactions[];

  // @OneToMany(() => Budgets, (budget) => budget.user)
  // budgets: Budgets[];

  // @OneToMany(() => SavingsGoals, (savingsGoal) => savingsGoal.user)
  // savingsGoals: SavingsGoals[];

  // @OneToMany(() => Reports, (report) => report.user)
  // reports: Reports[];

  // @OneToMany(() => Category, (categories) => categories.user)
  // categories: Category[];

  // @OneToMany(() => DailySummary, (daily_summary) => daily_summary.user)
  // dailySummaries: DailySummary[];

  // @OneToMany(() => MonthlySummary, (monthly_summary) => monthly_summary.user)
  // monthlySummaries: MonthlySummary[];

  // @OneToMany(
  //   () => MonthlyCategorySummary,
  //   (monthly_category_summary) => monthly_category_summary.user,
  // )
  // monthlyCategorySummaries: MonthlyCategorySummary[];

  // @OneToMany(() => AccountType, (account_type) => account_type.user)
  // accountTypes: AccountType[];

  // @OneToMany(() => Account, (account) => account.ownerUser)
  // accounts: AccountType[];
}
