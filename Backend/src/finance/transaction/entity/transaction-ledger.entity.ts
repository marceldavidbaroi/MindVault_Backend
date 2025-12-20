import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('account_ledger')
@Index(['accountId', 'creatorId', 'createdAt']) // The "Power Index"
export class TransactionLedger {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Index()
  @Column({ type: 'int', name: 'account_id' })
  accountId: number;

  @Index()
  @Column({ type: 'int', name: 'transaction_id' })
  transactionId: number;

  @Column({ type: 'jsonb', name: 'transaction_snapshot', nullable: true })
  transactionSnapshot: any;

  @Column({ type: 'int', name: 'creator_id', nullable: true })
  creatorId?: number | null;

  @Column({ type: 'jsonb', name: 'creator_snapshot', nullable: true })
  creatorSnapshot?: any;

  @Column({ type: 'varchar', name: 'external_ref_id', nullable: true })
  externalRefId?: string;

  @Column({ type: 'varchar', length: 20 })
  entryType: 'income' | 'expense' | 'reversal_income' | 'reversal_expense';

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'balance_after' })
  balanceAfter: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;
}
