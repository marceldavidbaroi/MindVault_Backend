import { IsOptional, IsString } from 'class-validator';

export class FilterUserRoleDto {
  @IsOptional()
  @IsString()
  search?: string;
}
