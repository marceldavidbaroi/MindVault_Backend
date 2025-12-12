import { Injectable, BadRequestException } from '@nestjs/common';
import { User } from '../entity/user.entity';
import { compareHash } from 'src/common/utils/hash.util';

@Injectable()
export class PasskeyValidator {
  async verifyPasskey(user: User, passkey: string) {
    if (user.passkey !== passkey) {
      throw new BadRequestException('Invalid or expired passkey');
    }
    return true;
  }

  async validatePasswordChange(
    user: User,
    oldPassword: string,
    newPassword: string,
  ) {
    // 1. Verify old password matches DB hash
    const isCorrect = await compareHash(oldPassword, user.password);
    if (!isCorrect) {
      throw new BadRequestException('Old password is incorrect');
    }

    // 2. Ensure new password is not the same as old password
    const isSame = await compareHash(newPassword, user.password);
    if (isSame) {
      throw new BadRequestException(
        'New password must be different from old password',
      );
    }

    return true;
  }
}
