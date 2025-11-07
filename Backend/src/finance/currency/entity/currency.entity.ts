import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ExchangeRate } from './exchange-rate.entity';
import { Transaction } from 'src/finance/transactions/entities/transaction.entity';

@Entity('currencies')
export class Currency {
  @ApiProperty({ example: 'USD', description: 'Currency code (ISO 4217)' })
  @PrimaryColumn({ type: 'char', length: 3 })
  code: string;

  @ApiProperty({
    example: 'United States Dollar',
    description: 'Currency name',
  })
  @Column({ type: 'varchar', length: 50 })
  name: string;

  @ApiProperty({ example: '$', description: 'Currency symbol' })
  @Column({ type: 'varchar', length: 5 })
  symbol: string;

  @ApiProperty({ example: 2, description: 'Number of decimals' })
  @Column({ type: 'int', name: 'decimal', default: 2 })
  decimal: number;

  @ApiProperty({ example: true, description: 'Whether currency is active' })
  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ExchangeRate, (rate) => rate.fromCurrency)
  fromRates: ExchangeRate[];

  @OneToMany(() => ExchangeRate, (rate) => rate.toCurrency)
  toRates: ExchangeRate[];

  @OneToMany(() => Transaction, (transaction) => transaction.currency)
  transactions: Transaction[];
}
