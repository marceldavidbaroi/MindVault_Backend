import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  Length,
} from 'class-validator';

import { Type } from 'class-transformer';
import type { AccountStatus } from '../account.entity';

export class CreateAccountDto {
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  accountTypeId: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  ownerUserId: number;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  balance?: number;

  @IsString()
  @Length(3, 3)
  currencyCode: string;

  @IsOptional()
  @IsEnum(['active', 'dormant', 'closed'])
  status?: AccountStatus;
}
