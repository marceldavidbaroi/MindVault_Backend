import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Currency } from './currency.entity';

@Entity('exchange_rates')
@Index(['fromCurrency', 'toCurrency', 'date'], { unique: true })
export class ExchangeRate {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Currency, { onDelete: 'CASCADE' })
  fromCurrency: Currency;

  @ManyToOne(() => Currency, { onDelete: 'CASCADE' })
  toCurrency: Currency;

  @ApiProperty({ example: 0.92, description: 'Exchange rate value' })
  @Column({ type: 'decimal', precision: 10, scale: 4 })
  rate: number;

  @ApiProperty({ example: '2024-11-03', description: 'Date of rate' })
  @Column({ type: 'date' })
  date: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;
}
