import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { PasswordResetLog } from '../entities/passwordResetLog.entity';
import { generatePasskey } from '../utils/passkey.util';

@Injectable()
export class PasskeyService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PasswordResetLog)
    private readonly passwordResetLogRepository: Repository<PasswordResetLog>,
  ) {}

  // ------------------- PRIVATE HELPER -------------------
  private async findUser(user: User): Promise<User> {
    const currentUser = await this.userRepository.findOne({
      where: { id: user.id },
    });
    if (!currentUser) throw new NotFoundException('User not found');
    return currentUser;
  }

  // ------------------- PASSKEY -------------------

  async getPasskey(
    user: User,
    password: string, // <-- password to verify
  ): Promise<{ passkey?: string; expiresAt?: Date }> {
    // Find the user in the database
    const currentUser = await this.findUser(user);
    if (!currentUser) {
      throw new Error('User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      currentUser.password,
    ); // use correct hashed password field
    if (!isPasswordValid) {
      throw new BadRequestException('Incorrect password');
    }
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    // Return passkey if password is valid
    return {
      passkey: currentUser.passkey,
      expiresAt: currentUser.passkeyExpiresAt,
    };
  }

  async resetPasswordWithPasskey(
    username: string,
    passkey: string,
    newPassword: string,
  ): Promise<{ message: string; newPasskey: string }> {
    // Find user by username
    const currentUser = await this.userRepository.findOne({
      where: { username },
    });

    if (!currentUser) {
      throw new BadRequestException('User not found');
    }

    if (currentUser.passkey !== passkey) {
      // Log failed attempt
      await this.passwordResetLogRepository.save({
        user: currentUser,
        method: 'passkey',
        success: false,
      });

      throw new BadRequestException('Invalid or expired passkey');
    }

    // Update password and reset passkey
    currentUser.password = await bcrypt.hash(newPassword, 10);
    currentUser.passkey = generatePasskey();
    currentUser.passkeyExpiresAt = undefined;
    currentUser.refreshToken = undefined;

    await this.userRepository.save(currentUser);

    // Log successful reset
    await this.passwordResetLogRepository.save({
      user: currentUser,
      method: 'passkey',
      success: true,
    });

    return {
      message: 'Password reset successfully',
      newPasskey: currentUser.passkey,
    };
  }

  async changePassword(
    user: User,
    oldPassword: string,
    newPassword: string,
    ipAddress?: string, // optional
  ): Promise<{ message: string }> {
    const currentUser = await this.findUser(user);

    const isMatch = await bcrypt.compare(oldPassword, currentUser.password);
    if (!isMatch) {
      // Log failed manual change attempt
      await this.passwordResetLogRepository.save({
        user: currentUser,
        method: 'manual',
        success: false,
        ipAddress,
        note: 'Old password incorrect',
      });

      throw new BadRequestException('Old password is incorrect');
    }

    currentUser.password = await bcrypt.hash(newPassword, 10);
    currentUser.passkey = generatePasskey();
    currentUser.passkeyExpiresAt = undefined;
    currentUser.refreshToken = undefined;

    await this.userRepository.save(currentUser);

    // Log successful manual change
    await this.passwordResetLogRepository.save({
      user: currentUser,
      method: 'manual',
      success: true,
      ipAddress,
      note: 'User-initiated password change',
    });

    return { message: 'Password changed successfully' };
  }
}
