import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Account } from './account.entity';
import { Role } from 'src/roles/entity/role.entity';
import { User } from 'src/auth/entity/user.entity';

@Unique(['accountId', 'userId'])
@Entity('account_user_roles')
export class AccountUserRole {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier for the role mapping',
  })
  @PrimaryGeneratedColumn()
  id: number;

  // ---------- Foreign keys ----------
  @ApiProperty({ example: 1, description: 'Account ID' })
  @Column({ type: 'int', name: 'account_id' })
  accountId: number;

  @ApiProperty({ example: 1, description: 'User ID' })
  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @ApiProperty({ example: 2, description: 'Role ID' })
  @Column({ type: 'int', name: 'role_id' })
  roleId: number;

  // ---------- Relations ----------
  @ManyToOne(() => Account, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id' })
  account?: Account;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => Role, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role?: Role;

  // ---------- Timestamps ----------
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;

  constructor(partial: Partial<AccountUserRole>) {
    Object.assign(this, partial);
  }
}
