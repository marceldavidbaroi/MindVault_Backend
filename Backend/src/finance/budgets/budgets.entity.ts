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
import { User } from 'src/auth/user.entity';
import { Category } from 'src/finance/categories/categories.entity';

@Entity('budgets')
@Index(['user', 'year', 'month', 'category'], { unique: true })
export class Budgets {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.budgets, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Category, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number; // budgeted amount

  @Column({ type: 'int' })
  month: number; // 1–12

  @Column({ type: 'int' })
  year: number; // e.g., 2025

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;
}
