import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from 'src/auth/entity/user.entity';

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
@Index(['userId', 'name', 'scope'], { unique: true }) // ✅ use userId, not relation
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  // ✅ Explicit FK column
  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId?: number;

  // ✅ Relation
  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

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
  })
  scope: CategoryScope;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;
}
