import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TagGroup } from './tag-group.entity';

@Entity({ name: 'tags' })
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: false, name: 'name' })
  name: string;

  @Column({ type: 'varchar', length: 150, name: 'display_name' })
  displayName: string;

  @Column({ type: 'text', nullable: true, name: 'description' })
  description?: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'icon' })
  icon?: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'color' })
  color?: string;

  @Column({ type: 'boolean', default: false, name: 'is_system' })
  isSystem: boolean;

  @Column({ type: 'int', nullable: true, name: 'user_id' })
  userId?: number;

  @Column({ type: 'int', nullable: true, name: 'group_id' })
  groupId?: number;

  @ManyToOne(() => TagGroup)
  @JoinColumn({ name: 'group_id' })
  group?: TagGroup;

  @Column({ type: 'boolean', default: false, name: 'is_deleted' })
  isDeleted: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
