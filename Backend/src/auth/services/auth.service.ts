import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { User } from '../entities/user.entity';
import { UserSession } from '../entities/userSessions.entity';
import { UserPreferences } from '../entities/userPreferences.entity';
import { authCredentialsDto } from '../dto/auth-credentials.dto';
import { SigninDto } from '../dto/sign-in.dto';
import { generatePasskey } from '../utils/passkey.util';

export interface JwtPayload {
  sub: number;
  email?: string;
  username: string;
  exp?: number; // ✅ add this
  iat?: number; // ✅ add this
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserPreferences)
    private readonly preferencesRepository: Repository<UserPreferences>,
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
    private readonly jwtService: JwtService,
  ) {}

  // ------------------- PRIVATE HELPERS -------------------
  private async findUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['preferences'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  // ------------------- SIGNUP -------------------
  async signup(
    authCredentialsDto: authCredentialsDto,
  ): Promise<{ message: string; passkey: string }> {
    const { username, password } = authCredentialsDto;

    const existingUser = await this.userRepository.findOne({
      where: { username },
    });
    if (existingUser) throw new ConflictException('Username already exists');

    const hashedPassword = await this.hashPassword(password);
    const passkey = generatePasskey();

    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      passkey,
      passkeyExpiresAt: undefined,
      isActive: true,
    });

    try {
      await this.userRepository.save(user);

      const preferences = this.preferencesRepository.create({
        user,
        frontend: {},
        backend: {},
      });
      await this.preferencesRepository.save(preferences);

      return { message: 'Signup successful', passkey };
    } catch {
      throw new InternalServerErrorException('Error creating user');
    }
  }

  // ------------------- SIGNIN -------------------
  async signin(
    authCredentialsDto: SigninDto,
    res: Response,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{ user: Partial<User> }> {
    const { username, password } = authCredentialsDto;

    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    const payload: JwtPayload = { sub: user.id, username };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Save session
    const session = this.userSessionRepository.create({
      user,
      refreshToken: await bcrypt.hash(refreshToken, 10),
      userAgent,
      ipAddress,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    await this.userSessionRepository.save(session);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, refreshToken: __, ...safeUser } = user;
    return { user: safeUser };
  }

  // ------------------- REFRESH TOKEN -------------------
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

    const session = await this.userSessionRepository.findOne({
      where: { user: { id: Number(payload.sub) } },
    });

    if (
      !session ||
      !(await bcrypt.compare(refreshToken, session.refreshToken))
    ) {
      throw new UnauthorizedException('Refresh token invalid or expired');
    }

    // ✅ Remove exp and iat before re-signing
    const { exp, iat, ...cleanPayload } = payload;

    const newAccessToken = this.jwtService.sign(cleanPayload, {
      expiresIn: '1h',
    });
    const newRefreshToken = this.jwtService.sign(cleanPayload, {
      expiresIn: '7d',
    });

    session.refreshToken = await bcrypt.hash(newRefreshToken, 10);
    session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.userSessionRepository.save(session);

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
  async logout(userId: number, refreshToken?: string, res?: Response) {
    if (refreshToken) {
      await this.userSessionRepository.delete({ refreshToken });
    } else {
      await this.userSessionRepository.delete({ user: { id: userId } });
    }

    if (res) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
    }
  }
}
