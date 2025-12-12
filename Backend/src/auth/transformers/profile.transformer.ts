import { Injectable } from '@nestjs/common';
import { User } from '../entity/user.entity';
import { UserPreferences } from '../entity/userPreferences.entity';

@Injectable()
export class ProfileTransformer {
  toSafeUser(user: User) {
    const { password, refreshToken, passkey, ...safeUser } = user;
    return safeUser;
  }

  formatPreferences(preferences?: UserPreferences) {
    return preferences || { frontend: {}, backend: {} };
  }
}
