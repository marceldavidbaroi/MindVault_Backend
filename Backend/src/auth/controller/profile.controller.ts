import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ProfileService } from '../services/profile.service';
import { GetUser } from '../get-user.decorator';
import { User } from '../entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import type { ApiResponse as ApiResponseType } from 'src/common/types/api-response.type';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdatePreferencesDto } from '../dto/update-preferences.dto';

@ApiTags('Auth Profile')
@ApiBearerAuth()
@Controller('profile')
@UseGuards(AuthGuard('jwt'))
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // ------------------- GET PROFILE -------------------
  @Get()
  @ApiOperation({ summary: 'Fetch the authenticated user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile fetched successfully',
    schema: {
      example: {
        success: true,
        message: 'Profile fetched successfully',
        data: {
          id: 1,
          username: 'johndoe',
          email: 'john@example.com',
          createdAt: '2024-01-01T10:00:00.000Z',
          preferences: {
            frontend: { theme: 'dark' },
            backend: { language: 'typescript' },
          },
        },
      },
    },
  })
  async getProfile(
    @GetUser() user: User,
  ): Promise<ApiResponseType<Partial<User> & { preferences: any }>> {
    const profile = await this.profileService.getProfile(user);
    return {
      success: true,
      message: 'Profile fetched successfully',
      data: profile,
    };
  }

  // ------------------- UPDATE PROFILE -------------------
  @Patch()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiBody({
    type: UpdateProfileDto,
    description: 'Fields allowed for update: username, email, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: 1,
          username: 'newusername',
          email: 'newemail@example.com',
        },
      },
    },
  })
  async updateProfile(
    @GetUser() user: User,
    @Body() updateData: UpdateProfileDto,
  ): Promise<ApiResponseType<Partial<User>>> {
    const updated = await this.profileService.updateProfile(user, updateData);
    return {
      success: true,
      message: 'Profile updated successfully',
      data: updated,
    };
  }

  // ------------------- UPDATE PREFERENCES -------------------
  @Patch('preferences')
  @ApiOperation({ summary: 'Update application preferences for the user' })
  @ApiBody({
    type: UpdatePreferencesDto,
    description: 'Preferences organized into frontend and backend objects',
  })
  @ApiResponse({
    status: 200,
    description: 'Preferences updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Preferences updated successfully',
        data: {
          frontend: { theme: 'light', fontSize: 'medium' },
          backend: { language: 'golang' },
        },
      },
    },
  })
  async updatePreferences(
    @GetUser() user: User,
    @Body() updateData: UpdatePreferencesDto,
  ): Promise<
    ApiResponseType<{
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
