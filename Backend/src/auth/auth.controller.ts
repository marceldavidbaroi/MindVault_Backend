import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthCredentailsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import { GetUser } from './get-user.decorator';
import { User } from './user.entity';
import { SigninDto } from './dto/sign-in.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import type { ApiResponse } from 'src/common/types/api-response.type';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  async signUp(
    @Body() authCredentailsDto: AuthCredentailsDto,
  ): Promise<ApiResponse<null>> {
    await this.authService.signup(authCredentailsDto);
    return {
      success: true,
      message: 'User signed up successfully',
      data: null,
    };
  }

  @Post('/signin')
  async signIn(
    @Body() authCredentailsDto: SigninDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<Partial<User>>> {
    const { user } = await this.authService.signin(authCredentailsDto, res);

    return {
      success: true,
      message: 'User signed in successfully',
      data: user,
    };
  }

  @Post('/refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<null>> {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token found');
    }

    await this.authService.refreshAccessToken(refreshToken, res);

    return {
      success: true,
      message: 'Access token refreshed successfully',
      data: null,
    };
  }

  @Post('/logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(
    @GetUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<null>> {
    await this.authService.logout(user.id, res);

    return {
      success: true,
      message: 'User logged out successfully',
      data: null,
    };
  }

  @Get('/me')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@GetUser() user: User): Promise<ApiResponse<Partial<User>>> {
    const profile = await this.authService.getProfile(user.id);
    return {
      success: true,
      message: 'Profile fetched successfully',
      data: profile,
    };
  }

  @Patch('/me')
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(
    @GetUser() user: User,
    @Body() updateData: Partial<User>,
  ): Promise<ApiResponse<Partial<User>>> {
    const updated = await this.authService.updateProfile(user.id, updateData);
    return {
      success: true,
      message: 'Profile updated successfully',
      data: updated,
    };
  }

  @Patch('/me/preferences')
  @UseGuards(AuthGuard('jwt'))
  async updatePreferences(
    @GetUser() user: User,
    @Body()
    updateData: {
      frontend?: Record<string, any>;
      backend?: Record<string, any>;
    },
  ): Promise<
    ApiResponse<{
      frontend?: Record<string, any>;
      backend?: Record<string, any>;
    }>
  > {
    const updated = await this.authService.updatePreferences(
      user.id,
      updateData,
    );
    return {
      success: true,
      message: 'Preferences updated successfully',
      data: updated,
    };
  }
}
