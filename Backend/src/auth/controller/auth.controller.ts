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
import { User } from '../entity/user.entity';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import type { ApiResponse } from 'src/common/types/api-response.type';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ------------------- SIGNUP -------------------
  @Post('/signup')
  @ApiOperation({ summary: 'Register a new user' })
  @SwaggerApiResponse({
    status: 201,
    description: 'User registered successfully',
  })
  @ApiBody({ type: authCredentialsDto })
  async signUp(@Body() dto: authCredentialsDto): Promise<ApiResponse<any>> {
    return this.authService.signup(dto);
  }

  // ------------------- SIGNIN -------------------
  @Post('/signin')
  @ApiOperation({ summary: 'Login user and set authentication cookies' })
  @SwaggerApiResponse({
    status: 200,
    description: 'User signed in successfully',
    type: User,
  })
  @ApiBody({ type: SigninDto })
  async signIn(
    @Body() dto: SigninDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<ApiResponse<Partial<User>>> {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    return this.authService.signin(dto, res, userAgent, ipAddress);
  }

  // ------------------- REFRESH TOKEN -------------------
  @Post('/refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Access token refreshed successfully',
  })
  @ApiCookieAuth('refreshToken')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<any>> {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) throw new UnauthorizedException('No refresh token');

    return this.authService.refreshAccessToken(refreshToken, res);
  }

  // ------------------- LOGOUT -------------------
  @Post('/logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Logout user and clear cookies' })
  @SwaggerApiResponse({
    status: 200,
    description: 'User logged out successfully',
  })
  @ApiBearerAuth()
  @ApiCookieAuth('refreshToken')
  async logout(
    @GetUser() user: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<null>> {
    const refreshToken = req.cookies['refreshToken'];
    return this.authService.logout(user.id, refreshToken, res);
  }
}
