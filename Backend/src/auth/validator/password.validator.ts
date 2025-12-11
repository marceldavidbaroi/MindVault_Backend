import { Injectable, BadRequestException } from '@nestjs/common';
import { User } from '../entity/user.entity';
import { compareHash } from 'src/common/utils/hash.util';

@Injectable()
export class PasswordValidator {
  async verifyPassword(user: User, password: string) {
    const isValid = await compareHash(password, user.password);
    if (!isValid) throw new BadRequestException('Incorrect password');
    return true;
  }
}
