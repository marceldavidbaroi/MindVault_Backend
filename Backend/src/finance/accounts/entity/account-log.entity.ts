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

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ type: 'int', name: 'account_id' })
  accountId: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', name: 'user_id', nullable: true })
  userId: number | null;

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
