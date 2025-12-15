import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'tag_groups' })
export class TagGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, name: 'name' })
  name: string;

  @Column({ type: 'varchar', length: 150, name: 'display_name' })
  displayName: string;

  @Column({ type: 'text', nullable: true, name: 'description' })
  description?: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'icon' })
  icon?: string;

  @Column({ type: 'boolean', default: false, name: 'is_system' })
  isSystem: boolean;

  @Column({ type: 'int', nullable: true, name: 'user_id' })
  userId?: number;

  @Column({ type: 'boolean', default: false, name: 'is_deleted' })
  isDeleted: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
