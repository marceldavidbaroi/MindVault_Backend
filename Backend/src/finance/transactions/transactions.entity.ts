import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/auth/user.entity';
import { Category } from 'src/finance/categories/categories.entity';

export type TransactionType = 'income' | 'expense';
export type RecurringInterval = 'daily' | 'weekly' | 'monthly' | 'yearly';

@Entity('transactions')
@Index('idx_user_date', ['user', 'date']) // For period queries
@Index('idx_user_category_date', ['user', 'category', 'date']) // For category reports
@Index('idx_user_recurring', ['user', 'recurring']) // For recurring transactions
export class Transactions {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;

  @Column({ type: 'enum', enum: ['income', 'expense'] })
  type: TransactionType;

  @ManyToOne(() => Category, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  @Index()
  category: Category;

  @Column('decimal', { precision: 18, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  date: string; // YYYY-MM-DD

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: false })
  recurring: boolean;

  @Column({
    type: 'enum',
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    nullable: true,
    name: 'recurring_interval',
  })
  recurringInterval?: RecurringInterval;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;
}
