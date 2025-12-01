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
import { Category } from 'src/finance/categories/categories.entity';

export type TransactionType = 'income' | 'expense';

@Entity('monthly_category_summaries')
@Index(['account', 'year', 'month', 'category', 'type'], { unique: true })
export class MonthlyCategorySummary {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, (monthly) => monthly.monthlyCategorySummary, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  month: number;

  @ManyToOne(() => Category, (category) => category.monthlyCategorySummary, {
    nullable: false,
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'varchar', length: 10 })
  type: TransactionType;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
    name: 'total_amount',
  })
  totalAmount: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;
}
