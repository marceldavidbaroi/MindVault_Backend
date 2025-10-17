import { User } from 'src/auth/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ReportType {
  MONTHLY = 'monthly',
  HALF_YEARLY = 'half_yearly',
  YEARLY = 'yearly',
}

@Entity('reports')
export class Reports {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.reports, { onDelete: 'CASCADE' })
  user: User;

  @Column({
    type: 'enum',
    enum: ReportType,
    name: 'report_type', // DB column stays snake_case
  })
  reportType: ReportType; // property camelCase

  @Column({ type: 'date', name: 'period_start' })
  periodStart: string; // property camelCase

  @Column({ type: 'date', name: 'period_end' })
  periodEnd: string; // property camelCase

  @Column({ type: 'jsonb' })
  data: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;
}
