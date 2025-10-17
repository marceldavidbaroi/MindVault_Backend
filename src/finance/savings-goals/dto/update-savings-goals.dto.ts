import { PartialType } from '@nestjs/mapped-types';
import { CreateSavingsGoalDto } from './create-savings-goals.dto';

export class UpdateSavingsGoalDto extends PartialType(CreateSavingsGoalDto) {}
