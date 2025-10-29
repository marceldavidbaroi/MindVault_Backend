import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from 'src/auth/user.entity';
import { AccountType } from '../account_types/account_types.entity'; // assuming exists
import { Transactions } from '../transactions/transactions.entity';

export type AccountStatus = 'active' | 'dormant' | 'closed';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AccountType, (account_type) => account_type.accounts)
  @JoinColumn({ name: 'account_type_id' })
  accountType: AccountType;

  @ManyToOne(() => User, (user) => user.accounts)
  @JoinColumn({ name: 'owner_user_id' })
  ownerUser: User;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  balance: number;

  @Column({ name: 'currency_code', length: 3 })
  currencyCode: string;

  @Column({ length: 20, default: 'active' })
  status: AccountStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Transactions, (transaction) => transaction.account)
  transactions: Transactions[];
}
