import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import type { AuditAction } from '../constants/transaction-audit-log.constants';

@Entity('transaction_audit_log')
// 1. For looking up the history of a specific transaction (ordered by time)
@Index(['transactionId', 'createdAt'])
// 2. For auditing a specific person's actions across the system
@Index(['actorId', 'createdAt'])
export class TransactionAuditLog {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'int', name: 'transaction_id' })
  transactionId: number;

  @Column({ type: 'int', name: 'actor_id' })
  actorId: number; // The person who performed the action

  @Column({ type: 'jsonb', name: 'actor_snapshot' })
  actorSnapShot: any; // The person who performed the action

  @Column({ type: 'varchar', length: 50 })
  action: AuditAction;

  @Column({ type: 'jsonb', nullable: true })
  payloadBefore: any; // State of the transaction before the change

  @Column({ type: 'jsonb', nullable: true })
  payloadAfter: any; // State of the transaction after the change

  @Column({ type: 'text', nullable: true })
  reason: string; // Why was this changed? (Important for deletes/voids)

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
