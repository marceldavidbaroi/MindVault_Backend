import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { UserPreferences } from '../../entities/userPreferences.entity';
import { UserSession } from '../../entities/userSessions.entity';
import { JwtService } from '@nestjs/jwt';
import { VerifyUserService } from '../verify-user.service';
import { authCredentialsDto } from '../../dto/auth-credentials.dto';
import { SigninDto } from '../../dto/sign-in.dto';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// ----- MOCKS -----
jest.mock('bcrypt', () => ({
  hash: jest.fn((pw) => Promise.resolve('hashed' + pw)),
  compare: jest.fn(),
}));

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(),
  verify: jest.fn(),
});

const mockVerifyUserService = () => ({
  verify: jest.fn(),
});

const mockResponse = () => ({
  cookie: jest.fn(),
  clearCookie: jest.fn(),
});

// ----- TESTS -----
describe('AuthService', () => {
  let service: AuthService;
  let userRepo: any;
  let prefsRepo: any;
  let sessionRepo: any;
  let jwtService: any;
  let verifyUserService: any;
  let res: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useFactory: mockRepository },
        {
          provide: getRepositoryToken(UserPreferences),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(UserSession),
          useFactory: mockRepository,
        },
        { provide: JwtService, useFactory: mockJwtService },
        { provide: VerifyUserService, useFactory: mockVerifyUserService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get(getRepositoryToken(User));
    prefsRepo = module.get(getRepositoryToken(UserPreferences));
    sessionRepo = module.get(getRepositoryToken(UserSession));
    jwtService = module.get(JwtService);
    verifyUserService = module.get(VerifyUserService);
    res = mockResponse();

    jest.clearAllMocks();
    (bcrypt.compare as jest.Mock).mockClear();
  });

  // ------------------ SIGNUP ------------------
  describe('signup', () => {
    it('should create new user with preferences', async () => {
      verifyUserService.verify.mockRejectedValueOnce(new Error('Not found'));
      userRepo.create.mockReturnValue({});
      userRepo.save.mockResolvedValue({ id: 1 } as User);
      prefsRepo.create.mockReturnValue({});
      prefsRepo.save.mockResolvedValue({});

      const result = await service.signup({
        username: 'test',
        password: '123',
      });
      expect(result.message).toBe('Signup successful');
      expect(result.passkey).toBeDefined();
      expect(userRepo.create).toHaveBeenCalled();
      expect(userRepo.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if username exists', async () => {
      verifyUserService.verify.mockResolvedValue({ id: 1 } as User);
      await expect(
        service.signup({ username: 'test', password: '123' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException if save fails', async () => {
      verifyUserService.verify.mockRejectedValueOnce(new Error('Not found'));
      userRepo.create.mockReturnValue({});
      userRepo.save.mockRejectedValueOnce(new Error('DB error'));
      await expect(
        service.signup({ username: 'test', password: '123' }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ------------------ SIGNIN ------------------
  describe('signin', () => {
    const dto: SigninDto = { username: 'user1', password: 'pass123' };
    const mockUser = {
      id: 1,
      username: 'user1',
      password: 'hashedpass',
      isActive: true,
    } as User;

    it('should signin successfully and set cookies', async () => {
      verifyUserService.verify.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign
        .mockReturnValueOnce('accessToken')
        .mockReturnValueOnce('refreshToken');
      sessionRepo.create.mockReturnValue({});
      sessionRepo.save.mockResolvedValue({});

      const result = await service.signin(dto, res as any);

      expect(result.user.username).toBe(mockUser.username);
      expect(res.cookie).toHaveBeenCalledTimes(2);
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(sessionRepo.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException on wrong password', async () => {
      verifyUserService.verify.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.signin(dto, res as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if user does not exist', async () => {
      verifyUserService.verify.mockRejectedValue({ name: 'NotFoundException' });
      await expect(service.signin(dto, res as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ------------------ REFRESH TOKEN ------------------
  describe('refreshAccessToken', () => {
    const refreshToken = 'refresh123';
    const mockUser = { id: 1, username: 'user1' } as User;
    const mockSession = {
      refreshToken: 'hashedToken',
      user: { id: 1 },
    } as UserSession;
    const payload = { sub: 1, username: 'user1' };

    beforeEach(() => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    });

    it('should refresh tokens successfully', async () => {
      jwtService.verify.mockReturnValue(payload);
      verifyUserService.verify.mockResolvedValue(mockUser);
      sessionRepo.findOne.mockResolvedValue(mockSession);
      jwtService.sign
        .mockReturnValueOnce('newAccess')
        .mockReturnValueOnce('newRefresh');
      sessionRepo.save.mockResolvedValue({});

      const result = await service.refreshAccessToken(refreshToken, res as any);
      expect(result.accessToken).toBe('newAccess');
      expect(res.cookie).toHaveBeenCalledTimes(2);
      expect(sessionRepo.save).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if no refresh token', async () => {
      await expect(
        service.refreshAccessToken(undefined as any, res as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token invalid', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid');
      });
      await expect(
        service.refreshAccessToken('token', res as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if session not found', async () => {
      jwtService.verify.mockReturnValue(payload);
      verifyUserService.verify.mockResolvedValue(mockUser);
      sessionRepo.findOne.mockResolvedValue(null);
      await expect(
        service.refreshAccessToken(refreshToken, res as any),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ------------------ LOGOUT ------------------
  describe('logout', () => {
    it('should delete session by refreshToken', async () => {
      sessionRepo.delete.mockResolvedValue({});
      await service.logout(1, 'token', res as any);
      expect(sessionRepo.delete).toHaveBeenCalledWith({
        refreshToken: 'token',
      });
      expect(res.clearCookie).toHaveBeenCalledTimes(2);
    });

    it('should delete all sessions by userId', async () => {
      sessionRepo.delete.mockResolvedValue({});
      await service.logout(1, undefined, res as any);
      expect(sessionRepo.delete).toHaveBeenCalledWith({ user: { id: 1 } });
    });

    it('should not fail if res not provided', async () => {
      sessionRepo.delete.mockResolvedValue({});
      await service.logout(1);
      expect(sessionRepo.delete).toHaveBeenCalledWith({ user: { id: 1 } });
    });
  });
});
