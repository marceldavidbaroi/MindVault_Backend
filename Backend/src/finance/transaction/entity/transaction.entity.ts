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
import { Account } from 'src/finance/accounts/entity/account.entity';
import { User } from 'src/auth/entity/user.entity';
import { Currency } from 'src/finance/currency/entity/currency.entity';
import { Category } from 'src/finance/category/entity/categories.entity';
import type {
  PaymentMethod,
  TransactionStatus,
  TransactionType,
} from '../constants/transaction.constants';

@Entity('transactions')
@Index(['accountId', 'transactionDate'])
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  // --- Decoupled Relation IDs ---

  @Column({ name: 'account_id' })
  accountId: number;

  @Column({ name: 'creator_id' })
  creatorId: number;

  @Column({ name: 'category_id', nullable: true })
  categoryId?: number;

  @Column({ name: 'currency_code', nullable: true })
  currencyCode?: string;

  // --- Object Relations ---

  @ManyToOne(() => Account, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creator_id' })
  creatorUser: User;

  @ManyToOne(() => Category, {
    nullable: true,
  })
  @JoinColumn({ name: 'category_id' })
  category?: Category;

  @ManyToOne(() => Currency, {
    nullable: true,
  })
  @JoinColumn({ name: 'currency_code' })
  currency?: Currency;

  // --- Transaction Details ---

  @Column({ type: 'varchar', length: 10 })
  type: TransactionType;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'payment_method',
    default: 'digital',
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: string;

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

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;
}
