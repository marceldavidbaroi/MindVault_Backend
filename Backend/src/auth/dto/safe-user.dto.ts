// src/auth/dto/safe-user.dto.ts
import { Expose } from 'class-transformer';

export class SafeUserDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  email: string;
}
