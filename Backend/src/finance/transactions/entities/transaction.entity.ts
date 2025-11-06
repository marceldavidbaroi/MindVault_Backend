import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  OneToMany,
} from 'typeorm';
import { Account } from 'src/finance/accounts/entity/account.entity';
import { User } from 'src/auth/entities/user.entity';
import { Category } from 'src/finance/categories/categories.entity';
import { Currency } from 'src/finance/currency/entity/currency.entity';

export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'pending' | 'cleared' | 'void' | 'failed';
export type RecurringInterval = 'daily' | 'weekly' | 'monthly' | 'yearly';

@Entity('transactions')
@Index(['externalRefId'], {
  unique: true,
  where: '"external_ref_id" IS NOT NULL',
})
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, { nullable: false })
  account: Account;

  @ManyToOne(() => User, (user) => user.transactions, { nullable: false })
  creatorUser: User;

  @ManyToOne(() => Category, (category) => category.transactions, {
    nullable: true,
  })
  category?: Category;

  @Column({ type: 'varchar', length: 10 })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: string;

  @ManyToOne(() => Currency, { nullable: true })
  currency?: Currency;

  @Column({ type: 'date', name: 'transaction_date' })
  transactionDate: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  status: TransactionStatus;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'external_ref_id',
    nullable: true,
  })
  externalRefId?: string;

  @Column({ type: 'boolean', default: false })
  recurring: boolean;

  @Column({
    type: 'varchar',
    length: 10,
    name: 'recurring_interval',
    nullable: true,
  })
  recurringInterval?: RecurringInterval;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;
}
