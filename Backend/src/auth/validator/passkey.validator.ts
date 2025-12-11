import { Injectable, BadRequestException } from '@nestjs/common';
import { User } from '../entity/user.entity';

@Injectable()
export class PasskeyValidator {
  async verifyPasskey(user: User, passkey: string) {
    if (user.passkey !== passkey) {
      throw new BadRequestException('Invalid or expired passkey');
    }
    return true;
  }
}
