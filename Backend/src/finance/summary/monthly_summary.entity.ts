import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from 'src/auth/entities/user.entity';

@Entity('monthly_summary')
@Index(['user', 'year', 'month'], { unique: true }) // composite index
export class MonthlySummary {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ManyToOne(() => User, (user) => user.monthlySummaries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', name: 'year' })
  year: number;

  @Column({ type: 'int', name: 'month' })
  month: number;

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
