import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ProfileService } from '../services/profile.service';
import { GetUser } from '../get-user.decorator';
import { User } from '../entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import type { ApiResponse } from 'src/common/types/api-response.type';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdatePreferencesDto } from '../dto/update-preferences.dto';

@Controller('profile')
@UseGuards(AuthGuard('jwt'))
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // ------------------- GET PROFILE -------------------
  @Get()
  async getProfile(
    @GetUser() user: User,
  ): Promise<ApiResponse<Partial<User> & { preferences: any }>> {
    const profile = await this.profileService.getProfile(user);
    return {
      success: true,
      message: 'Profile fetched successfully',
      data: profile,
    };
  }

  // ------------------- UPDATE PROFILE -------------------
  @Patch()
  async updateProfile(
    @GetUser() user: User,
    @Body() updateData: UpdateProfileDto,
  ): Promise<ApiResponse<Partial<User>>> {
    const updated = await this.profileService.updateProfile(user, updateData);
    return {
      success: true,
      message: 'Profile updated successfully',
      data: updated,
    };
  }

  // ------------------- UPDATE PREFERENCES -------------------
  @Patch('preferences')
  async updatePreferences(
    @GetUser() user: User,
    @Body()
    updateData: UpdatePreferencesDto,
  ): Promise<
    ApiResponse<{
      frontend?: Record<string, any>;
      backend?: Record<string, any>;
    }>
  > {
    const updated = await this.profileService.updatePreferences(
      user,
      updateData,
    );
    return {
      success: true,
      message: 'Preferences updated successfully',
      data: updated,
    };
  }
}
