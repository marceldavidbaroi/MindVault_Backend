import { IsString, IsOptional, IsObject, Length } from 'class-validator';

export class CreateUserRoleDto {
  @IsString()
  @Length(2, 50)
  name: string;

  @IsOptional()
  @IsObject()
  permissions?: Record<string, boolean>;

  @IsOptional()
  @IsString()
  description?: string;
}
