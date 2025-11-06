import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/auth/entities/user.entity';
import { AccountType } from './account-type.entity';
import { AccountUserRole } from './account-user-role.entity';

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
  initialBalance: number;

  @ManyToOne(() => AccountType, (type) => type.accounts)
  @JoinColumn({ name: 'type_id' })
  type: AccountType;

  @ApiProperty({ example: 1, description: 'Owner user ID' })
  @Column({ type: 'int', name: 'owner_id' })
  ownerId: number;

  @ManyToOne(() => User, (user) => user.accounts)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => AccountUserRole, (role) => role.account)
  userRoles: AccountUserRole[];

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;
}
