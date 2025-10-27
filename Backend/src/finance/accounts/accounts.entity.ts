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
import { User } from 'src/auth/user.entity';

export type AccountType =
  | 'personal'
  | 'joint'
  | 'business'
  | 'savings_goal'
  | 'other';

export type AccountStatus = 'active' | 'dormant' | 'closed';

@Entity('accounts')
@Index('idx_owner_user', ['ownerUser'])
@Index('idx_currency', ['currencyCode'])
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_user_id' })
  @Index()
  ownerUser: User;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ['personal', 'joint', 'business', 'savings_goal', 'other'],
    default: 'personal',
  })
  type: AccountType;

  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'varchar', length: 3, name: 'currency_code' })
  currencyCode: string; // ISO 4217 code (e.g. USD, EUR, BDT)

  @Column({
    type: 'enum',
    enum: ['active', 'dormant', 'closed'],
    default: 'active',
  })
  status: AccountStatus;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'updated_at',
  })
  updatedAt: Date;
}
