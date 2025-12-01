import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserPreferences } from '../entities/userPreferences.entity';
import { UserSecurityQuestion } from '../entities/userSecurityQuestion.entity';
import { PasswordResetLog } from '../entities/passwordResetLog.entity';
import { VerifyUserService } from './verify-user.service';

interface FrontendPreferences {
  theme?: 'light' | 'dark';
  layout?: string;
  [key: string]: any;
}

interface BackendPreferences {
  notifications?: boolean;
  [key: string]: any;
}

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly verifyUserService: VerifyUserService,
    @InjectRepository(UserPreferences)
    private readonly preferencesRepository: Repository<UserPreferences>,
  ) {}

  // ------------------- PROFILE -------------------
  async getProfile(user: User) {
    const currentUser = await this.verifyUserService.verify(user.id);

    const { password, refreshToken, passkey, ...safeUser } = currentUser;
    const preferences = currentUser.preferences || {
      frontend: {},
      backend: {},
    };

    return {
      ...safeUser,
      preferences,
    };
  }

  async updateProfile(user: User, updateData: Partial<User>) {
    const currentUser = await this.verifyUserService.verify(user.id);
    Object.assign(currentUser, updateData);
    await this.userRepository.save(currentUser);

    const { password, refreshToken, passkey, ...safeUser } = currentUser;
    return safeUser;
  }

  async updatePreferences(
    user: User,
    updateData: {
      frontend?: FrontendPreferences;
      backend?: BackendPreferences;
    },
  ) {
    const currentUser = await this.verifyUserService.verify(user.id);

    let prefs = currentUser.preferences;
    if (!prefs) {
      prefs = this.preferencesRepository.create({
        user: currentUser,
        frontend: {},
        backend: {},
      });
    }

    prefs.frontend = { ...prefs.frontend, ...updateData.frontend };
    prefs.backend = { ...prefs.backend, ...updateData.backend };
    await this.preferencesRepository.save(prefs);

    return prefs;
  }
}
