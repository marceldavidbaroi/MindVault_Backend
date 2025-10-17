import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { User } from 'src/auth/user.entity';

@Entity('categories')
@Unique(['name'])
export class Category {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ManyToOne(() => User, (user) => user.categories, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' }) // foreign key column in DB
  @Index()
  user?: User | null;

  @Column({ type: 'varchar', length: 50, name: 'name' })
  name: string;

  @Column({ type: 'varchar', length: 50, name: 'display_name' })
  displayName: string;

  @Column({ type: 'enum', enum: ['income', 'expense'], name: 'type' })
  type: 'income' | 'expense';

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;
}
