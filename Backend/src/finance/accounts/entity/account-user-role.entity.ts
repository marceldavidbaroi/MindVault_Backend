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
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/auth/entities/user.entity';
import { Account } from './account.entity';
import { Role } from 'src/roles/role.entity';

// export enum AccountUserRoleType {
//   OWNER = 'owner',
//   EDITOR = 'editor',
//   VIEWER = 'viewer',
// }

@Index(['accountId', 'userId'], { unique: true })
@Entity('account_user_roles')
export class AccountUserRole {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier for the role mapping',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1, description: 'Account ID' })
  @Column({ type: 'int', name: 'account_id' })
  accountId: number;

  @ManyToOne(() => Account, (account) => account.userRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @ApiProperty({ example: 2, description: 'User ID' })
  @Column({ type: 'int', name: 'user_id' })
  userId: number;

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
