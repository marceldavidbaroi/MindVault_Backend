import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from 'src/finance/accounts/entity/account.entity';

export type GoalStatus = 'active' | 'achieved' | 'cancelled';

@Entity('savings_goals')
export class SavingsGoal {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Account, (account) => account.savingsGoal, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  // Added the purpose/description column
  @Column({ type: 'text', nullable: true })
  purpose: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'target_amount' })
  target_amount: string;

  @Column({ type: 'date', name: 'target_date', nullable: true })
  target_date?: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'active',
  })
  status: GoalStatus;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updated_at: Date;
}
