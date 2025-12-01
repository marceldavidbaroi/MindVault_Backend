import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToOne,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/auth/entities/user.entity';
import { Account } from './account.entity';
import { Role } from 'src/roles/role.entity';

@Unique(['account', 'user'])
@Entity('account_user_roles')
export class AccountUserRole {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier for the role mapping',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, (account) => account.userRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @ManyToOne(() => User, (user) => user.accountRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    example: 'viewer',
    description: 'Role assigned to the user for the account',
  })
  @ManyToOne(() => Role, (role) => role.accountUserRoles, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;

  constructor(partial: Partial<AccountUserRole>) {
    Object.assign(this, partial);
  }
}
