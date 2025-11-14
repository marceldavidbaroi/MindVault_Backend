import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { Account } from 'src/finance/accounts/entity/account.entity';
import { Transaction } from './transaction.entity';
import { User } from 'src/auth/entities/user.entity';

@Entity('account_ledger')
@Index(['accountId', 'transactionId'], { unique: true })
export class AccountLedger {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'account_id' })
  accountId: number;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account?: Account;

  @Column({ name: 'transaction_id', nullable: true })
  transactionId?: number | null;

  @ManyToOne(() => Transaction)
  @JoinColumn({ name: 'transaction_id' })
  transaction?: Transaction;

  @Column({ name: 'creator_id', nullable: true })
  creatorId?: number | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creator_id' })
  creatorUser?: User;

  @Column({ type: 'varchar', length: 10 })
  entryType: 'income' | 'expense';

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  balanceAfter: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;
}
