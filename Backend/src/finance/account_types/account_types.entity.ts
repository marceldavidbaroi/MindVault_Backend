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
import { User } from 'src/auth/user.entity';
import { Account } from '../account/account.entity';

@Entity('account_types')
@Index('idx_account_type_name', ['name'])
@Index('idx_account_type_slug', ['slug'])
export class AccountType {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.accountTypes, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' }) // the creator user
  @Index()
  user?: User | null;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string; // Human-readable name (e.g. “Personal Account”)

  @Column({ type: 'varchar', length: 50, unique: true })
  slug: string; // Internal code (e.g. personal, business)

  @Column({ type: 'boolean', default: false })
  is_group: boolean; // Marks shared/group accounts

  @Column({ type: 'boolean', default: false })
  is_goal: boolean; // Marks savings goal accounts

  @Column({ type: 'text', nullable: true })
  description?: string; // Optional description

  @Column({ type: 'boolean', default: true })
  is_active: boolean; // Whether available for selection

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Account, (account) => account.accountType)
  accounts: Account[];
}
