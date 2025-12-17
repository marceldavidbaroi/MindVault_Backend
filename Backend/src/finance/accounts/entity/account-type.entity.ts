import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Account } from './account.entity';

export enum AccountScope {
  PERSONAL = 'personal',
  BUSINESS = 'business',
  FAMILY = 'family',
  SHARED = 'shared',
}

@Entity('account_types')
export class AccountType {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier for account type',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Savings', description: 'Type of the account' })
  @Column({ type: 'varchar', length: 50 })
  name: string;

  @ApiProperty({
    example: 'A savings account typically used for storing money',
    description: 'Description of the account type',
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({ example: true, description: 'Whether account type is active' })
  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({
    example: 'personal',
    description: 'Scope of the account type',
    enum: ['personal', 'business', 'family', 'shared'],
    default: 'personal',
  })
  @Column({
    type: 'varchar',
    length: 20,
    default: 'personal',
  })
  scope: AccountScope;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;
}
