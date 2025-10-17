import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from 'src/auth/user.entity';

@Entity('daily_summary')
@Index(['user', 'date'], { unique: true }) // composite index
export class DailySummary {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ManyToOne(() => User, (user) => user.dailySummaries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date', name: 'date' })
  date: string; // only YYYY-MM-DD

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    name: 'total_income',
    default: 0,
  })
  totalIncome: string;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    name: 'total_expense',
    default: 0,
  })
  totalExpense: string;
}
