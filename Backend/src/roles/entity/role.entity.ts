import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('roles')
@Index(['name'], { unique: true })
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'display_name',
  })
  displayName?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'boolean',
    name: 'is_system',
    default: false,
  })
  isSystem: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;
}
