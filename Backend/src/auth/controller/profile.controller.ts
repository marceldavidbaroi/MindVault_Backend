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
import { User } from '../entity/user.entity';
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
  })
  async getProfile(@GetUser() user: User): Promise<ApiResponseType<any>> {
    return await this.profileService.getProfile(user);
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
  })
  async updateProfile(
    @GetUser() user: User,
    @Body() updateData: UpdateProfileDto,
  ): Promise<ApiResponseType<Partial<User>>> {
    return await this.profileService.updateProfile(user, updateData);
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
    return await this.profileService.updatePreferences(user, updateData);
  }
}
