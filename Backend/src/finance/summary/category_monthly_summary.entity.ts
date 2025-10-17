import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from 'src/auth/user.entity';
import { Category } from 'src/finance/categories/categories.entity';

export type TransactionType = 'income' | 'expense';

@Entity('monthly_category_summary')
@Index(['user', 'year', 'month', 'category', 'type'], { unique: true }) // composite index
export class MonthlyCategorySummary {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ManyToOne(() => User, (user) => user.monthlyCategorySummaries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', name: 'year' })
  year: number;

  @Column({ type: 'int', name: 'month' })
  month: number;

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'enum', enum: ['income', 'expense'], name: 'type' })
  type: TransactionType;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    name: 'total_amount',
    default: 0,
  })
  totalAmount: string;
}
