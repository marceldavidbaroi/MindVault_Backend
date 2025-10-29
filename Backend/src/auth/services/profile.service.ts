import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserPreferences } from '../entities/userPreferences.entity';
import { UserSecurityQuestion } from '../entities/userSecurityQuestion.entity';
import { PasswordResetLog } from '../entities/passwordResetLog.entity';

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
    @InjectRepository(UserPreferences)
    private readonly preferencesRepository: Repository<UserPreferences>,
  ) {}

  // ------------------- PRIVATE HELPER -------------------
  private async findUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['preferences'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ------------------- PROFILE -------------------
  async getProfile(user: User) {
    const currentUser = await this.findUser(user.id);
    const { password, refreshToken, ...safeUser } = currentUser;

    return {
      ...safeUser,
      preferences: user.preferences || { frontend: {}, backend: {} },
    };
  }

  async updateProfile(user: User, updateData: Partial<User>) {
    const currentUser = await this.findUser(user.id);
    Object.assign(currentUser, updateData);
    await this.userRepository.save(currentUser);

    const { password, refreshToken, ...safeUser } = currentUser;
    return safeUser;
  }

  async updatePreferences(
    user: User,
    updateData: {
      frontend?: FrontendPreferences;
      backend?: BackendPreferences;
    },
  ) {
    const currentUser = await this.findUser(user.id);

    let prefs = currentUser.preferences;
    if (!prefs) {
      prefs = this.preferencesRepository.create({
        user,
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
