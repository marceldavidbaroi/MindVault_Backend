import {
  Body,
  Controller,
  Post,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { authCredentialsDto } from '../dto/auth-credentials.dto';
import { SigninDto } from '../dto/sign-in.dto';
import { GetUser } from '../get-user.decorator';
import { User } from '../entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import type { ApiResponse } from 'src/common/types/api-response.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ------------------- SIGNUP -------------------
  @Post('/signup')
  async signUp(@Body() dto: authCredentialsDto): Promise<ApiResponse<null>> {
    const result = await this.authService.signup(dto);
    return {
      success: true,
      message: result.message,
      data: null,
    };
  }

  // ------------------- SIGNIN -------------------
  @Post('/signin')
  async signIn(
    @Body() dto: SigninDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<ApiResponse<Partial<User>>> {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;
    const { user } = await this.authService.signin(
      dto,
      res,
      userAgent,
      ipAddress,
    );
    return {
      success: true,
      message: 'User signed in successfully',
      data: user,
    };
  }

  // ------------------- REFRESH TOKEN -------------------
  @Post('/refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<null>> {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) throw new UnauthorizedException('No refresh token');

    await this.authService.refreshAccessToken(refreshToken, res);
    return {
      success: true,
      message: 'Access token refreshed successfully',
      data: null,
    };
  }

  // ------------------- LOGOUT -------------------
  @Post('/logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(
    @GetUser() user: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<null>> {
    const refreshToken = req.cookies['refreshToken'];
    await this.authService.logout(user.id, refreshToken, res);
    return {
      success: true,
      message: 'User logged out successfully',
      data: null,
    };
  }
}
