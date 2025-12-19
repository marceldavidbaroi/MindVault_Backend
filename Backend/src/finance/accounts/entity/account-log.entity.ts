import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/auth/entity/user.entity';
import { Account } from './account.entity';

@Entity('account_logs')
export class AccountLog {
  @ApiProperty({ example: 1, description: 'Unique log ID' })
  @PrimaryGeneratedColumn()
  id: number;

  // Account relation
  @ManyToOne(() => Account, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'account_id' })
  account: Account | null;

  @Column({ type: 'int', name: 'account_id', nullable: true })
  accountId: number | null;

  // User relation
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ type: 'int', name: 'user_id', nullable: true })
  userId: number | null;

  // Snapshot of user at the time of action
  @Column({ type: 'jsonb', nullable: true })
  userSnapshot: {
    id: number;
    name: string;
    email?: string;
  } | null;

  // Snapshot of account at the time of action (optional)
  @Column({ type: 'jsonb', nullable: true })
  accountSnapshot: {
    id: number;
    accountNumber: string;
    ownerId: number;
    typeId: number;
    currencyCode: string;
    balance: string;
  } | null;

  @ApiProperty({
    description: 'Type of action: create/update/delete/balance_change',
  })
  @Column({ type: 'varchar', length: 50 })
  action: string;

  @ApiProperty({ description: 'Old values before change' })
  @Column({ type: 'jsonb', nullable: true })
  oldValue: Record<string, any> | null;

  @ApiProperty({ description: 'New values after change' })
  @Column({ type: 'jsonb', nullable: true })
  newValue: Record<string, any> | null;

  @ApiProperty({
    description: 'Transaction ID if balance change is due to transaction',
    nullable: true,
  })
  @Column({ type: 'int', nullable: true })
  transactionId: number | null;

  @ApiProperty({
    description: 'Source of automated balance change',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  source: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;
}
