import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export type PasswordResetMethod = 'passkey' | 'security_questions' | 'manual';

@Entity()
export class PasswordResetLog extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: true })
  userId: number;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: ['passkey', 'security_questions', 'manual'] })
  method: PasswordResetMethod;

  @Column({ default: false })
  success: boolean;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  note?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
