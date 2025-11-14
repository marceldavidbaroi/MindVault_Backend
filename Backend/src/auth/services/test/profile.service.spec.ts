import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from '../profile.service';
import { VerifyUserService } from '../verify-user.service';
import { User } from '../../entities/user.entity';
import { UserPreferences } from '../../entities/userPreferences.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

// --------------------- MOCKS ---------------------
const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
});

const mockVerifyUserService = () => ({
  verify: jest.fn(),
});

describe('ProfileService', () => {
  let service: ProfileService;
  let userRepo: jest.Mocked<Repository<User>>;
  let prefsRepo: jest.Mocked<Repository<UserPreferences>>;
  let verifyUserService: jest.Mocked<VerifyUserService>;

  const mockUser: User = {
    id: 1,
    username: 'user1',
    email: 'user1@example.com',
    password: 'hashedPassword',
    passkey: 'passkey123',
    refreshToken: 'refresh123',
    preferences: {
      frontend: { theme: 'light' },
      backend: { notifications: true },
    },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: getRepositoryToken(User), useFactory: mockRepository },
        {
          provide: getRepositoryToken(UserPreferences),
          useFactory: mockRepository,
        },
        { provide: VerifyUserService, useFactory: mockVerifyUserService },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    userRepo = module.get(getRepositoryToken(User));
    prefsRepo = module.get(getRepositoryToken(UserPreferences));
    verifyUserService = module.get(VerifyUserService);

    jest.clearAllMocks();
  });

  // ---------------- GET PROFILE ----------------
  describe('getProfile', () => {
    it('should return profile with preferences', async () => {
      verifyUserService.verify.mockResolvedValue(mockUser);

      const result = await service.getProfile(mockUser);

      expect(result).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        preferences: mockUser.preferences,
      });
    });

    it('should handle user with no preferences', async () => {
      const userNoPrefs = { ...mockUser, preferences: null };
      verifyUserService.verify.mockResolvedValue(userNoPrefs);

      const result = await service.getProfile(userNoPrefs);

      expect(result.preferences).toEqual({ frontend: {}, backend: {} });
    });

    it('should throw if user not found', async () => {
      verifyUserService.verify.mockRejectedValue(new NotFoundException());
      await expect(service.getProfile(mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ---------------- UPDATE PROFILE ----------------
  describe('updateProfile', () => {
    it('should update user fields and return safe user', async () => {
      const updatedData = { email: 'new@example.com' };
      const updatedUser = { ...mockUser, ...updatedData };
      verifyUserService.verify.mockResolvedValue(mockUser);
      userRepo.save.mockResolvedValue(updatedUser as any);

      const result = await service.updateProfile(mockUser, updatedData);

      expect(userRepo.save).toHaveBeenCalledWith(
        expect.objectContaining(updatedData),
      );
      expect(result.email).toBe('new@example.com');
      expect(result.password).toBeUndefined();
      expect(result.refreshToken).toBeUndefined();
      expect(result.passkey).toBeUndefined();
    });
  });

  // ---------------- UPDATE PREFERENCES ----------------
  describe('updatePreferences', () => {
    it('should update existing preferences', async () => {
      const updateData = {
        frontend: { theme: 'dark' },
        backend: { notifications: false },
      };
      const updatedPrefs = {
        frontend: { theme: 'dark' },
        backend: { notifications: false },
      };
      const userWithPrefs = { ...mockUser };
      verifyUserService.verify.mockResolvedValue(userWithPrefs);
      prefsRepo.save.mockResolvedValue(updatedPrefs as any);

      const result = await service.updatePreferences(userWithPrefs, updateData);

      expect(result.frontend).toEqual(updatedPrefs.frontend);
      expect(result.backend).toEqual(updatedPrefs.backend);
    });

    it('should create preferences if none exist', async () => {
      const userNoPrefs = { ...mockUser, preferences: null };
      verifyUserService.verify.mockResolvedValue(userNoPrefs);

      const createMock = {
        frontend: { theme: 'dark' },
        backend: { notifications: true },
        user: userNoPrefs,
      };
      prefsRepo.create.mockReturnValue(createMock);
      prefsRepo.save.mockResolvedValue(createMock);

      const result = await service.updatePreferences(userNoPrefs, {
        frontend: { theme: 'dark' },
        backend: { notifications: true },
      });

      expect(prefsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          frontend: {},
          backend: {},
          user: expect.objectContaining({ id: userNoPrefs.id }), // only check ID
        }),
      );
      expect(result.frontend).toEqual({ theme: 'dark' });
      expect(result.backend).toEqual({ notifications: true });
    });

    it('should merge new preferences with existing ones', async () => {
      const userWithPrefs = {
        ...mockUser,
        preferences: {
          frontend: { layout: 'grid' },
          backend: { notifications: false },
        },
      };
      verifyUserService.verify.mockResolvedValue(userWithPrefs);
      prefsRepo.save.mockResolvedValue({} as any);

      const result = await service.updatePreferences(userWithPrefs, {
        frontend: { theme: 'dark' },
      });

      expect(result.frontend).toEqual({ layout: 'grid', theme: 'dark' });
      expect(result.backend).toEqual({ notifications: false });
    });
  });
});
