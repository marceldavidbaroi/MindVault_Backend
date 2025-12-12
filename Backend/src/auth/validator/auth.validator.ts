import { Injectable, BadRequestException } from '@nestjs/common';
import { User } from '../entity/user.entity';
import { compareHash } from 'src/common/utils/hash.util';

@Injectable()
export class AuthValidator {
  async validatePassword(password: string, user: User) {
    const valid = await compareHash(password, user.password);
    if (!valid) throw new BadRequestException('Invalid password');
    return true;
  }

  async compareRefreshToken(incoming: string, stored: string) {
    const isValid = await compareHash(incoming, stored);
    if (!isValid)
      throw new BadRequestException('Refresh token invalid or expired');
    return true;
  }
}
