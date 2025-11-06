import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Transaction } from './transaction.entity';
import { User } from 'src/auth/entities/user.entity';

@Entity('recurring_transaction_schedules')
export class RecurringTransactionSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Transaction, { nullable: false })
  transaction: Transaction;

  @ManyToOne(() => User, { nullable: false })
  owner: User;

  // next due date
  @Column({ type: 'date', name: 'next_run_date' })
  nextRunDate: string;

  @Column({ type: 'varchar', length: 10, name: 'interval' })
  interval: string; // 'daily' | 'weekly' | 'monthly' | 'yearly'

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;
}
