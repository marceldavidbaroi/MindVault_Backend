import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class PasswordResetLog extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.passwordResetLogs, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column()
  method: 'passkey' | 'security_questions';

  @Column({ default: false })
  success: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
