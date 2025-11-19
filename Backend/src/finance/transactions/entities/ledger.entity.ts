import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('account_ledger')
@Index(['accountId', 'transactionId', 'createdAt'], { unique: true })
export class AccountLedger {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'account_id' })
  accountId: number;

  @Column({ type: 'int', name: 'transaction_id', nullable: true })
  transactionId?: number | null;

  @Column({ type: 'int', name: 'creator_id', nullable: true })
  creatorId?: number | null;

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
