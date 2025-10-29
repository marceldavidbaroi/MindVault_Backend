import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Transactions } from '../transactions/transactions.entity';

@Entity('currencies')
export class Currency {
  @PrimaryColumn({ type: 'varchar', length: 3, name: 'code' })
  code: string; // ISO 4217 code

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 5 })
  symbol: string;

  @Column({ type: 'int' })
  decimal: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Transactions, (transaction) => transaction.currency)
  transactions: Transactions[];
}
