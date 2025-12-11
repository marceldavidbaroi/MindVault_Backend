// profile.service.ts
import { Injectable } from '@nestjs/common';
import { ProfileValidator } from '../validator/profile.validator';
import { User } from '../entity/user.entity';
import { UserValidator } from '../validator/user.validator';
import { AuthTransformer } from '../transformers/auth.transformer';
import { ProfileTransformer } from '../transformers/profile.transformer';
import { UserRepository } from '../repository/user.repository';
import { UserPreferencesRepository } from '../repository/user-preferences.repository';

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
    private readonly validator: ProfileValidator,
    private readonly userValidator: UserValidator,
    private readonly authTransformer: AuthTransformer,
    private readonly profileTransformer: ProfileTransformer,
    private readonly userRepository: UserRepository,
    private readonly userPreferencesRepo: UserPreferencesRepository,
  ) {}

  // ------------------- GET PROFILE -------------------
  async getProfile(user: User) {
    const currentUser = await this.userValidator.ensureUserExists(user.id);
    const safeUser = this.authTransformer.safeUser(currentUser);
    const preferences = this.profileTransformer.formatPreferences(
      currentUser.preferences,
    );

    return {
      success: true,
      message: 'Profile fetched successfully',
      data: { ...safeUser, preferences: preferences },
    };
  }

  // ------------------- UPDATE PROFILE -------------------
  async updateProfile(user: User, updateData: Partial<User>) {
    this.validator.validateUpdateData(updateData);

    const currentUser = await this.userValidator.ensureUserExists(user.id);
    Object.assign(currentUser, updateData);
    await this.userRepository.saveUser(currentUser);

    return {
      success: true,
      message: 'Profile updated successfully',
      data: this.authTransformer.safeUser(currentUser),
    };
  }

  // ------------------- UPDATE PREFERENCES -------------------
  async updatePreferences(
    user: User,
    updateData: {
      frontend?: FrontendPreferences;
      backend?: BackendPreferences;
    },
  ) {
    const currentUser = await this.userValidator.ensureUserExists(user.id);

    let preferences = currentUser.preferences;
    if (!preferences) {
      preferences = this.userPreferencesRepo.createPreferences({
        user: currentUser,
        frontend: {},
        backend: {},
      });
    }

    preferences.frontend = { ...preferences.frontend, ...updateData.frontend };
    preferences.backend = { ...preferences.backend, ...updateData.backend };

    await this.userPreferencesRepo.savePreferences(preferences);

    return {
      success: true,
      message: 'Preferences updated successfully',
      data: this.profileTransformer.formatPreferences(preferences),
    };
  }
}
