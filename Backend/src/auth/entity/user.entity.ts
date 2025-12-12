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
import { UserSecurityQuestion } from './userSecurityQuestion.entity';
import { PasswordResetLog } from './passwordResetLog.entity';
import { UserSession } from './userSessions.entity';
import { Category } from 'src/finance/categories/categories.entity';
import { Account } from 'src/finance/accounts/entity/account.entity';
import { AccountUserRole } from 'src/finance/accounts/entity/account-user-role.entity';
import { Transaction } from 'src/finance/transactions/entities/transaction.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true, select: false })
  refreshToken?: string;

  @Column({ nullable: true, select: false })
  passkey?: string;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'passkey_expires_at',
    select: false,
  })
  passkeyExpiresAt?: Date;

  @Column({
    type: 'boolean',
    default: false,
    name: 'has_security_questions',
    select: false,
  })
  hasSecurityQuestions: boolean;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
    select: false,
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'updated_at',
    select: false,
  })
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

  @OneToMany(() => Transaction, (transaction) => transaction.creatorUser)
  transactions: Transaction[];
}
