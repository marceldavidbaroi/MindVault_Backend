import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/auth/entities/user.entity';
import { AccountType } from './account-type.entity';
import { AccountUserRole } from './account-user-role.entity';
import { DailySummary } from 'src/finance/summary/entity/daily-summary.entity';
import { MonthlySummary } from 'src/finance/summary/entity/monthly-summary.entity';
import { MonthlyCategorySummary } from 'src/finance/summary/entity/monthly-category-summary.entity';
import { Currency } from 'src/finance/currency/entity/currency.entity';
import { DailyCategorySummary } from 'src/finance/summary/entity/daily-category-summary.entity';
import { WeeklySummary } from 'src/finance/summary/entity/weekly-summary.entity';
import { YearlySummary } from 'src/finance/summary/entity/yearly-summary.entity';

@Entity('accounts')
export class Account {
  @ApiProperty({ example: 1, description: 'Unique identifier for the account' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Main Savings', description: 'Account display name' })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({
    example: 'Savings account for personal use',
    description: 'Description of the account',
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({ example: 5000, description: 'Initial balance' })
  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'initial_balance' })
  initialBalance: string;

  @ApiProperty({ example: 5000, description: 'Balance' })
  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    name: 'balance',
    default: 0,
  })
  balance: string;

  @ManyToOne(() => AccountType, (type) => type.accounts)
  @JoinColumn({ name: 'type_id' })
  type: AccountType;

  @ApiProperty({ example: 1, description: 'Owner user ID' })
  @Column({ type: 'int', name: 'owner_id' })
  ownerId: number;

  @ManyToOne(() => Currency, (currency) => currency.code)
  @JoinColumn({ name: 'currency_code' })
  currencyCode: Currency;

  @ManyToOne(() => User, (user) => user.accounts)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => AccountUserRole, (role) => role.account)
  userRoles: AccountUserRole[];

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => DailySummary, (dailySummary) => dailySummary.account)
  dailySummary: DailySummary[];

  @OneToMany(() => MonthlySummary, (monthlySummary) => monthlySummary.account)
  monthlySummary: MonthlySummary[];

  @OneToMany(
    () => MonthlyCategorySummary,
    (monthlyCategorySummary) => monthlyCategorySummary.account,
  )
  monthlyCategorySummary: MonthlyCategorySummary[];

  @OneToMany(
    () => DailyCategorySummary,
    (dailyCategorySummary) => dailyCategorySummary.account,
  )
  dailyCategorySummaries: DailyCategorySummary[];

  @OneToMany(() => WeeklySummary, (weeklySummary) => weeklySummary.account)
  weeklySummaries: WeeklySummary[];

  @OneToMany(() => YearlySummary, (yearlySummary) => yearlySummary.account)
  yearlySummaries: YearlySummary[];
}
