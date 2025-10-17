import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  Min,
  IsEnum,
} from 'class-validator';
import { Priority } from '../savings-goals.entity';

export class CreateSavingsGoalDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  targetAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  savedAmount?: number;

  @IsOptional()
  @IsEnum(Priority, { message: 'Priority must be HIGH, MEDIUM, or LOW' })
  priority?: Priority;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
