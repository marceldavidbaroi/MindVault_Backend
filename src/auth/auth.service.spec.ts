import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

// ✅ Mock the entire bcrypt module
// Mock bcrypt completely
jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed_pass'),
  compare: jest.fn().mockResolvedValue(true),
}));

const mockUserRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(),
});

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
        { provide: JwtService, useFactory: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signup', () => {
    it('should create a new user', async () => {
      userRepository.findOne.mockResolvedValue(undefined);
      userRepository.create.mockReturnValue({
        username: 'test',
        password: 'hash',
      });
      userRepository.save.mockResolvedValue({});

      await expect(
        authService.signup({ username: 'test', password: 'pass' }),
      ).resolves.toBeUndefined();
    });

    it('should throw conflict exception if user exists', async () => {
      userRepository.findOne.mockResolvedValue({ username: 'test' });

      await expect(
        authService.signup({ username: 'test', password: 'pass' }),
      ).rejects.toThrow('Username already exists');
    });
  });

  describe('signin', () => {
    it('should return accessToken and refreshToken if valid', async () => {
      // bcrypt.compare is already mocked globally
      const hashedPassword = 'hashed_pass'; // No need to hash real password in test
      userRepository.findOne.mockResolvedValue({
        id: 1,
        username: 'test',
        password: hashedPassword,
      });
      jwtService.sign = jest.fn().mockReturnValue('token');
      userRepository.save.mockResolvedValue({});

      const result = await authService.signin({
        username: 'test',
        password: 'pass',
      });
      expect(result).toEqual({ accessToken: 'token', refreshToken: 'token' });
    });
  });
});
