import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { AuthValidator } from '../validator/auth.validator';
import { AuthTransformer } from '../transformers/auth.transformer';
import { generatePasskey } from '../utils/passkey.util';
import { authCredentialsDto } from '../dto/auth-credentials.dto';
import { SigninDto } from '../dto/sign-in.dto';
import { UserValidator } from '../validator/user.validator';
import { hashString } from 'src/common/utils/hash.util';
import { UserRepository } from '../repository/user.repository';
import { UserPreferencesRepository } from '../repository/user-preferences.repository';
import { UserSessionRepository } from '../repository/user-session.repository';
import { parseDuration } from '../utils/parse-duration.util';

@Injectable()
export class AuthService {
  private readonly accessTokenExpiry =
    process.env.JWT_ACCESS_TOKEN_EXPIRES || '1h';
  private readonly refreshTokenExpiry =
    process.env.JWT_REFRESH_TOKEN_EXPIRES || '7d';

  constructor(
    private readonly userRepo: UserRepository,
    private readonly userPreferenceRepo: UserPreferencesRepository,
    private readonly userSessionRepo: UserSessionRepository,
    private readonly jwtService: JwtService,
    private readonly validator: AuthValidator,
    private readonly userValidator: UserValidator,
    private readonly transformer: AuthTransformer,
  ) {}

  // ------------------- SIGNUP -------------------
  async signup(dto: authCredentialsDto) {
    const { username, password } = dto;

    // check if username exists
    const existingUser = await this.userValidator.ensureUserExists(username);
    if (existingUser) throw new ConflictException('Username already exists');

    const hashedPassword = await hashString(password);
    const passkey = generatePasskey();

    const user = this.userRepo.createUser({
      username,
      password: hashedPassword,
      passkey,
      isActive: true,
    });

    try {
      const createdUser = await this.userRepo.saveUser(user);

      const preferences = this.userPreferenceRepo.createPreferences({
        user: createdUser,
        frontend: {},
        backend: {},
      });

      await this.userPreferenceRepo.savePreferences(preferences);

      return {
        success: true,
        message: 'Signup successful',
        data: { passkey },
      };
    } catch {
      throw new InternalServerErrorException('Error creating user');
    }
  }

  // ------------------- SIGNIN -------------------
  async signin(dto: SigninDto, res: Response, userAgent?: string, ip?: string) {
    const { username, password } = dto;

    // get user using validator
    const user = await this.userValidator
      .ensureUserExists(username)
      .catch(() => {
        throw new BadRequestException('Invalid username or password');
      });

    // check password
    await this.validator.validatePassword(password, user);

    // generate tokens
    const payload = { sub: user.id, username };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.accessTokenExpiry,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.refreshTokenExpiry,
    });

    const session = this.userSessionRepo.createSession({
      user,
      refreshToken: await hashString(refreshToken),
      userAgent,
      ipAddress: ip,
      expiresAt: new Date(Date.now() + parseDuration(this.refreshTokenExpiry)),
    });

    await this.userSessionRepo.saveSession(session);

    // set cookies
    this.setCookies(res, accessToken, refreshToken);

    return {
      success: true,
      message: 'Login successful',
      data: this.transformer.safeUser(user),
    };
  }

  // ------------------- REFRESH TOKEN -------------------
  async refreshAccessToken(refreshToken: string, res: Response) {
    if (!refreshToken)
      throw new UnauthorizedException('No refresh token provided');

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userValidator.ensureUserExists(payload.sub);
    const session = await this.userSessionRepo.findSessionByUserId(user.id);

    if (!session)
      throw new UnauthorizedException('Refresh token invalid or expired');

    await this.validator.compareRefreshToken(
      refreshToken,
      session.refreshToken,
    );

    const clean = { sub: user.id, username: user.username };
    const newAccess = this.jwtService.sign(clean, {
      expiresIn: this.accessTokenExpiry,
    });
    const newRefresh = this.jwtService.sign(clean, {
      expiresIn: this.refreshTokenExpiry,
    });

    session.refreshToken = await hashString(newRefresh);
    session.expiresAt = new Date(
      Date.now() + parseDuration(this.refreshTokenExpiry),
    );
    await this.userSessionRepo.saveSession(session);

    this.setCookies(res, newAccess, newRefresh);

    return {
      success: true,
      message: 'Token refreshed',
      data: { accessToken: newAccess },
    };
  }

  // ------------------- LOGOUT -------------------
  async logout(userId: number, refreshToken?: string, res?: Response) {
    if (refreshToken) {
      await this.userSessionRepo.deleteSessionByRefresh(refreshToken);
    } else {
      await this.userSessionRepo.deleteSessions(userId);
    }

    if (res) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
    }

    return { success: true, message: 'Logged out', data: null };
  }

  // ------------------- COOKIE HELPER -------------------
  private setCookies(res: Response, access: string, refresh: string) {
    const production = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', access, {
      httpOnly: true,
      secure: production,
      sameSite: 'strict',
      maxAge: parseDuration(this.accessTokenExpiry),
    });

    res.cookie('refreshToken', refresh, {
      httpOnly: true,
      secure: production,
      sameSite: 'strict',
      maxAge: parseDuration(this.refreshTokenExpiry),
    });
  }
}
