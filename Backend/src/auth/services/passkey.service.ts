// passkey.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PasskeyValidator } from '../validator/passkey.validator';
import { generatePasskey } from '../utils/passkey.util';
import { User } from '../entity/user.entity';
import * as bcrypt from 'bcrypt';
import { UserValidator } from '../validator/user.validator';
import { PasswordValidator } from '../validator/password.validator';
import { PasswordResetLogRepository } from '../repository/password-reset-log.repository';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class PasskeyService {
  constructor(
    private readonly validator: PasskeyValidator,
    private readonly userValidator: UserValidator,
    private readonly passwordValidator: PasswordValidator,
    private readonly passwordResetLogRepo: PasswordResetLogRepository,
    private readonly userRepo: UserRepository,
  ) {}

  // ------------------- GET PASSKEY -------------------
  async getPasskey(user: User, password: string) {
    const currentUser = await this.userValidator.ensureUserExists(user.id);
    await this.passwordValidator.verifyPassword(currentUser, password);

    return {
      success: true,
      message: 'Passkey fetched successfully',
      data: {
        passkey: currentUser.passkey,
        expiresAt: currentUser.passkeyExpiresAt,
      },
    };
  }

  // ------------------- RESET PASSWORD WITH PASSKEY -------------------
  async resetPasswordWithPasskey(
    username: string,
    passkey: string,
    newPassword: string,
  ) {
    const user = await this.userValidator.ensureUserExists(username);

    try {
      await this.validator.verifyPasskey(user, passkey);
    } catch (e) {
      // log failed attempt
      await this.passwordResetLogRepo.saveResetLog(
        this.passwordResetLogRepo.createResetLog({
          user,
          method: 'passkey',
          success: false,
        }),
      );
      throw e;
    }

    // reset password
    user.password = await bcrypt.hash(newPassword, 10);
    user.passkey = generatePasskey();
    user.passkeyExpiresAt = undefined;
    user.refreshToken = undefined;
    await this.userRepo.saveUser(user);

    // log success
    await this.passwordResetLogRepo.saveResetLog(
      this.passwordResetLogRepo.createResetLog({
        user,
        method: 'passkey',
        success: true,
      }),
    );

    return {
      success: true,
      message: 'Password reset successfully',
      data: { newPasskey: user.passkey },
    };
  }

  // ------------------- CHANGE PASSWORD -------------------
  async changePassword(
    user: User,
    oldPassword: string,
    newPassword: string,
    ipAddress?: string,
  ) {
    const currentUser = await this.userValidator.ensureUserExists(user.id);
    await this.passwordValidator.verifyPassword(currentUser, oldPassword);

    currentUser.password = await bcrypt.hash(newPassword, 10);
    currentUser.passkey = generatePasskey();
    currentUser.passkeyExpiresAt = undefined;
    currentUser.refreshToken = undefined;
    await this.userRepo.saveUser(currentUser);

    // log success
    await this.passwordResetLogRepo.saveResetLog(
      this.passwordResetLogRepo.createResetLog({
        user: currentUser,
        method: 'manual',
        success: true,
        ipAddress,
        note: 'User-initiated password change',
      }),
    );

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }
}
