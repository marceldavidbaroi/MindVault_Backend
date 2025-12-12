// passkey.service.ts
import { Injectable } from '@nestjs/common';
import { PasskeyValidator } from '../validator/passkey.validator';
import { generatePasskey } from '../utils/passkey.util';
import { User } from '../entity/user.entity';
import { UserValidator } from '../validator/user.validator';
import { PasswordValidator } from '../validator/password.validator';
import { PasswordResetLogRepository } from '../repository/password-reset-log.repository';
import { UserRepository } from '../repository/user.repository';
import { hashString } from 'src/common/utils/hash.util';
import { UserAuthValidator } from '../validator/user-auth.validator';

@Injectable()
export class PasskeyService {
  constructor(
    private readonly passkeyValidator: PasskeyValidator,
    private readonly userValidator: UserValidator,
    private readonly passwordValidator: PasswordValidator,
    private readonly passwordResetLogRepo: PasswordResetLogRepository,
    private readonly userRepo: UserRepository,
    private readonly userAuthValidator: UserAuthValidator,
  ) {}

  // ------------------- GET PASSKEY -------------------
  async getPasskey(user: User, password: string) {
    const currentUser = await this.userAuthValidator.ensureUserExistsForLogin(
      user.id,
    );
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
    const user =
      await this.userAuthValidator.ensureUserExistsForLogin(username);

    try {
      await this.passkeyValidator.verifyPasskey(user, passkey);
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
    user.password = await hashString(newPassword);
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
    const currentUser = await this.userAuthValidator.ensureUserExistsForLogin(
      user.id,
    );
    await this.passkeyValidator.validatePasswordChange(
      currentUser,
      oldPassword,
      newPassword,
    );
    currentUser.password = await hashString(newPassword);
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
