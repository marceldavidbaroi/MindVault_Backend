import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { User } from 'src/auth/entity/user.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { MonthlyCategorySummary } from '../summary/entity/monthly-category-summary.entity';
import { DailyCategorySummary } from '../summary/entity/daily-category-summary.entity';
export interface CategoryStats {
  total: number;
  income: {
    total: number;
    system: number;
    user: number;
  };
  expense: {
    total: number;
    system: number;
    user: number;
  };
}
// ✅ Use enums only (remove type alias)
export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum CategoryScope {
  GLOBAL = 'global',
  BUSINESS = 'business',
  FAMILY = 'family',
  INDIVIDUAL = 'individual',
}

@Entity('categories')
@Index(['user', 'name', 'scope'], { unique: true })
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Index()
  user?: User; // Only for individual categories

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'display_name' })
  displayName?: string;

  @Column({
    type: 'enum',
    enum: CategoryType,
    default: CategoryType.EXPENSE,
  })
  type: CategoryType;

  @Column({
    type: 'enum',
    enum: CategoryScope,
    default: CategoryScope.GLOBAL,
    name: 'scope',
  })
  scope: CategoryScope;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.category)
  transactions: Transaction[];

  @OneToMany(
    () => MonthlyCategorySummary,
    (monthlyCategorySummary) => monthlyCategorySummary.category,
  )
  monthlyCategorySummary: Category[];

  @OneToMany(
    () => DailyCategorySummary,
    (dailyCategorySummary) => dailyCategorySummary.category,
  )
  dailyCategorySummaries: DailyCategorySummary[];
}
