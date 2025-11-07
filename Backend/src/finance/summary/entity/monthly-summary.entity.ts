import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { Account } from 'src/finance/accounts/entity/account.entity';

@Entity('monthly_summaries')
@Index(['account', 'year', 'month'], { unique: true })
export class MonthlySummary {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, (account) => account.monthlySummary, {
    nullable: false,
  })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalIncome: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalExpense: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;
}
