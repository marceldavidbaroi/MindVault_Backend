import { User } from 'src/auth/entities/user.entity';
import { Transactions } from 'src/finance/transactions/transactions.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';

export enum Priority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

@Entity('savings_goals')
@Index('idx_savings_user', ['user'])
@Index('idx_savings_user_priority', ['user', 'priority'])
@Index('idx_savings_user_due_date', ['user', 'dueDate'])
export class SavingsGoals {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.savingsGoals, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'target_amount' })
  targetAmount: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    name: 'saved_amount',
  })
  savedAmount: number;

  @Column({ type: 'enum', enum: Priority, default: Priority.MEDIUM })
  priority: Priority;

  @Column({ type: 'date', nullable: true, name: 'due_date' })
  dueDate: Date;

  @CreateDateColumn({ type: 'time without time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'time without time zone', name: 'updated_at' })
  updatedAt: Date;
}
