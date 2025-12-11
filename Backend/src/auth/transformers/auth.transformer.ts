import { Injectable } from '@nestjs/common';
import { User } from '../entity/user.entity';

@Injectable()
export class AuthTransformer {
  safeUser(user: User): Partial<User> {
    const { password, refreshToken, ...safe } = user;
    return safe;
  }
}
