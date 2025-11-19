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

@Entity('daily_category_summaries')
@Index(['account', 'date', 'category', 'type'], { unique: true })
export class DailyCategorySummary {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, (account) => account.dailyCategorySummaries, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ type: 'date' })
  date: string;

  @ManyToOne(() => Category, (category) => category.dailyCategorySummaries, {
    nullable: false,
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'varchar', length: 10 })
  type: 'income' | 'expense';

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
