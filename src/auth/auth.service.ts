import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.entity';
import { AuthCredentailsDto } from './dto/auth-credentials.dto';
import { SigninDto } from './dto/sign-in.dto';
import { UserPreferences } from './userPreferences.entity';
import type { Response } from 'express';

interface JwtPayload {
  sub: number;
  username: string;
}

// Typed preferences
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
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserPreferences)
    private readonly preferencesRepository: Repository<UserPreferences>,
    private readonly jwtService: JwtService,
  ) {}

  // ------------------- SIGNUP -------------------
  async signup(
    authCredentailsDto: AuthCredentailsDto,
  ): Promise<{ message: string }> {
    const { username, password } = authCredentailsDto;

    const existingUser = await this.userRepository.findOne({
      where: { username },
    });
    if (existingUser) throw new ConflictException('Username already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      username,
      password: hashedPassword,
    });

    try {
      await this.userRepository.save(user);

      // Create default preferences
      const preferences = this.preferencesRepository.create({
        user,
        frontend: {},
        backend: {},
      });
      await this.preferencesRepository.save(preferences);

      return { message: 'Signup successful' };
    } catch {
      throw new InternalServerErrorException('Error creating user');
    }
  }

  // ------------------- SIGNIN -------------------
  async signin(
    authCredentailsDto: SigninDto,
    res: Response,
  ): Promise<{ user: Partial<User> }> {
    const { username, password } = authCredentailsDto;

    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    const payload: JwtPayload = { sub: user.id, username };

    // Sign tokens
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Hash and save refresh token
    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.save(user);

    // Set secure HttpOnly cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Exclude sensitive fields
    const { password: _, refreshToken: __, ...safeUser } = user;
    return { user: safeUser };
  }

  // ------------------- REFRESH ACCESS TOKEN -------------------
  async refreshAccessToken(
    refreshToken: string,
    res: Response,
  ): Promise<{ accessToken: string }> {
    if (!refreshToken)
      throw new UnauthorizedException('No refresh token provided');

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });
    if (!user || !user.refreshToken)
      throw new UnauthorizedException('User not found or token revoked');

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) throw new UnauthorizedException('Refresh token mismatch');

    // Optionally rotate refresh token
    const newAccessToken = this.jwtService.sign(
      { sub: user.id, username: user.username },
      { expiresIn: '1h' },
    );
    const newRefreshToken = this.jwtService.sign(
      { sub: user.id, username: user.username },
      { expiresIn: '7d' },
    );

    user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
    await this.userRepository.save(user);

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
    });
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: newAccessToken };
  }

  // ------------------- LOGOUT -------------------
  async logout(userId: number, res?: Response): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    user.refreshToken = undefined;
    await this.userRepository.save(user);

    if (res) {
      // Clear cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
    }
  }

  // ------------------- GET PROFILE -------------------
  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['preferences'],
    });
    if (!user) throw new NotFoundException('User not found');

    const { password, refreshToken, ...safeUser } = user;
    return {
      ...safeUser,
      preferences: user.preferences || { frontend: {}, backend: {} },
    };
  }

  // ------------------- UPDATE PROFILE -------------------
  async updateProfile(userId: number, updateData: Partial<User>) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, updateData);
    await this.userRepository.save(user);

    const { password, refreshToken, ...safeUser } = user;
    return safeUser;
  }

  // ------------------- UPDATE PREFERENCES -------------------
  async updatePreferences(
    userId: number,
    updateData: {
      frontend?: FrontendPreferences;
      backend?: BackendPreferences;
    },
  ) {
    let prefs = await this.preferencesRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!prefs) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

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
