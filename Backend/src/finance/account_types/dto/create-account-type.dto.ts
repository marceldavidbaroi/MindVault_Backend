import { IsString, IsOptional, IsBoolean, Length } from 'class-validator';

export class CreateAccountTypeDto {
  @IsString()
  @Length(2, 100)
  name: string;

  @IsString()
  @Length(2, 50)
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_group?: boolean;

  @IsOptional()
  @IsBoolean()
  is_goal?: boolean;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
