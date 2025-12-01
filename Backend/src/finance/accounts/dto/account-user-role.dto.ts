// src/finance/accounts/dto/account-user-role.dto.ts
import { Expose, Type } from 'class-transformer';
import { SafeUserDto } from 'src/auth/dto/safe-user.dto';

export class AccountUserRoleDto {
  @Expose()
  id: number;

  @Expose()
  accountId: number;

  @Expose()
  userId: number;

  @Expose()
  @Type(() => SafeUserDto)
  user: SafeUserDto;

  @Expose()
  role: {
    id: number;
    name: string;
    displayName?: string;
    description?: string;
  };

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
