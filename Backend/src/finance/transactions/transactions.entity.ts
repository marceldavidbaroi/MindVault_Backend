import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Category } from 'src/finance/categories/categories.entity';
import { Account } from 'src/finance/account/account.entity';
import { Currency } from 'src/finance/currencies/currencies.entity';

export type TransactionType = 'income' | 'expense';
export type RecurringInterval = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type TransactionStatus = 'pending' | 'cleared' | 'void';

@Entity('transactions')
@Unique(['externalRefId'])
@Index('idx_account_date', ['account', 'transactionDate'])
@Index('idx_account_category_date', ['account', 'category', 'transactionDate'])
@Index('idx_account_recurring', ['account', 'recurring'])
export class Transactions {
  @PrimaryGeneratedColumn()
  id: number;

  // 🔹 Which account this affects
  @ManyToOne(() => Account, (account) => account.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id' })
  @Index()
  account: Account;

  // 🔹 Who created the transaction
  @ManyToOne(() => User, (user) => user.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'creator_user_id' })
  @Index()
  creatorUser: User;

  // 🔹 Optional category
  @ManyToOne(() => Category, (category) => category.transactions, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'category_id' })
  @Index()
  category?: Category;

  // 🔹 Transaction type
  @Column({ type: 'varchar', length: 10 })
  @Index()
  type: TransactionType;

  // 🔹 Transaction amount
  @Column('decimal', { precision: 18, scale: 2 })
  amount: number;

  // 🔹 Currency reference (nullable if optional)
  @ManyToOne(() => Currency, (currency) => currency.transactions, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @JoinColumn({ name: 'currency_code', referencedColumnName: 'code' })
  @Index()
  currency?: Currency;

  // 🔹 Transaction date
  @Column({ type: 'date', name: 'transaction_date' })
  @Index()
  transactionDate: string; // YYYY-MM-DD

  // 🔹 Optional description
  @Column({ type: 'text', nullable: true })
  description?: string;

  // 🔹 Status
  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  status: TransactionStatus;

  // 🔹 External reference ID (optional)
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    unique: true,
    name: 'external_ref_id',
  })
  @Index()
  externalRefId?: string;

  // 🔹 Recurring flags
  @Column({ type: 'boolean', default: false })
  recurring: boolean;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    name: 'recurring_interval',
  })
  recurringInterval?: RecurringInterval;

  // 🔹 Timestamps
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;
}
