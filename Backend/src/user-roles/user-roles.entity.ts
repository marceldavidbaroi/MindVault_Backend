import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
} from 'typeorm';

@Entity('user_roles')
@Unique(['name'])
export class UserRole {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ type: 'varchar', length: 50, name: 'name' })
  @Index()
  name: string; // e.g. 'owner', 'admin', 'editor', 'viewer'

  @Column({ type: 'jsonb', nullable: true, name: 'permissions' })
  permissions?: Record<string, boolean>;

  @Column({ type: 'text', nullable: true, name: 'description' })
  description?: string;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'updated_at',
  })
  updatedAt: Date;
}
