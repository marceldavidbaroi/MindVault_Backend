import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/auth/entity/user.entity';
import { AccountType } from './account-type.entity';
import { Currency } from 'src/finance/currency/entity/currency.entity';

@Entity('accounts')
export class Account {
  @ApiProperty({ example: 1, description: 'Unique identifier for the account' })
  @PrimaryGeneratedColumn()
  id: number;

  // Remove manual sequence, auto-generate in service using ID + prefix
  @ApiProperty({ example: 'PER-1' })
  @Column({
    name: 'account_number',
    type: 'varchar',
    length: 20,
    unique: true,
  })
  accountNumber: string;

  @ApiProperty({ example: 'Main Savings', description: 'Account display name' })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({
    example: 'Savings account for personal use',
    description: 'Description',
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({ example: 5000, description: 'Initial balance' })
  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    name: 'initial_balance',
    default: 0,
  })
  initialBalance: string;

  @ApiProperty({ example: 5000, description: 'Current balance' })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: string;

  @ApiProperty({ example: 1, description: 'Account type ID' })
  @Column({ type: 'int', name: 'type_id' })
  typeId: number;

  @ManyToOne(() => AccountType)
  @JoinColumn({ name: 'type_id' })
  type: AccountType;

  @ApiProperty({ example: 1, description: 'Owner user ID' })
  @Column({ type: 'int', name: 'owner_id' })
  ownerId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @ApiProperty({ example: 'USD', description: 'Currency code' })
  @Column({ type: 'varchar', length: 3, name: 'currency_code' })
  currencyCode: string;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currency_code', referencedColumnName: 'code' })
  currency: Currency;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;
}
