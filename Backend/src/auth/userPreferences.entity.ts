import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserPreferences extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.preferences, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ type: 'json', default: {} })
  frontend: Record<string, any>; // UI-related preferences, themes, layouts

  @Column({ type: 'json', default: {} })
  backend: Record<string, any>; // Backend-related preferences, notifications, API settings
}
