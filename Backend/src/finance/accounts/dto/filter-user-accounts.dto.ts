import { IsOptional, IsInt } from 'class-validator';

export class FilterUserAccountsDto {
  @IsOptional()
  @IsInt()
  roleId?: number;
}
