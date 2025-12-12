import { Test, TestingModule } from '@nestjs/testing';
import { PasskeyService } from '../passkey.service';
import { Repository } from 'typeorm';
import { User } from '../../entity/user.entity';
import { PasswordResetLog } from '../../entity/passwordResetLog.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { generatePasskey } from '../../utils/passkey.util';

// --------------------- MOCKS ---------------------
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('../../utils/passkey.util', () => ({
  generatePasskey: jest.fn(),
}));

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
});

describe('PasskeyService', () => {
  let service: PasskeyService;
  let userRepo: jest.Mocked<Repository<User>>;
  let resetLogRepo: jest.Mocked<Repository<PasswordResetLog>>;

  const mockUser: User = {
    id: 1,
    username: 'user1',
    password: 'hashedPassword',
    passkey: 'passkey123',
    passkeyExpiresAt: new Date(Date.now() + 1000 * 60 * 60),
    refreshToken: 'refresh123',
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasskeyService,
        { provide: getRepositoryToken(User), useFactory: mockRepository },
        {
          provide: getRepositoryToken(PasswordResetLog),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PasskeyService>(PasskeyService);
    userRepo = module.get(getRepositoryToken(User));
    resetLogRepo = module.get(getRepositoryToken(PasswordResetLog));

    jest.clearAllMocks();
    (generatePasskey as jest.Mock).mockReturnValue('newPasskey123');
  });

  // ---------------- GET PASSKEY ----------------
  describe('getPasskey', () => {
    it('should return passkey if password is correct', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.getPasskey(mockUser, 'password');
      expect(result.passkey).toBe(mockUser.passkey);
      expect(result.expiresAt).toBe(mockUser.passkeyExpiresAt);
    });

    it('should throw BadRequestException if password is incorrect', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.getPasskey(mockUser, 'wrong')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.getPasskey(mockUser, 'password')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ---------------- RESET PASSWORD WITH PASSKEY ----------------
  describe('resetPasswordWithPasskey', () => {
    it('should reset password with valid passkey', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      resetLogRepo.save.mockResolvedValue({} as any);

      const result = await service.resetPasswordWithPasskey(
        'user1',
        'passkey123',
        'newPass',
      );

      expect(result.message).toBe('Password reset successfully');
      expect(result.newPasskey).toBe('newPasskey123'); // mock value
      expect(userRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'newHashedPassword' }),
      );
      expect(resetLogRepo.save).toHaveBeenCalledTimes(1); // only success log
    });

    it('should throw BadRequestException if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(
        service.resetPasswordWithPasskey('unknown', 'passkey', 'newPass'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if passkey invalid', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      resetLogRepo.save.mockResolvedValue({} as any); // log failed attempt

      await expect(
        service.resetPasswordWithPasskey('user1', 'wrongPasskey', 'newPass'),
      ).rejects.toThrow(BadRequestException);

      expect(resetLogRepo.save).toHaveBeenCalledTimes(1); // failed attempt logged
    });
  });

  // ---------------- CHANGE PASSWORD ----------------
  describe('changePassword', () => {
    it('should change password successfully with correct old password', async () => {
      jest.spyOn(service as any, 'findUser').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHash');
      resetLogRepo.save.mockResolvedValue({} as any);

      const result = await service.changePassword(
        mockUser,
        'oldPass',
        'newPass',
        '127.0.0.1',
      );
      expect(result.message).toBe('Password changed successfully');
      expect(userRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'newHash' }),
      );
      expect(resetLogRepo.save).toHaveBeenCalledTimes(1); // success log
    });

    it('should throw BadRequestException if old password is incorrect', async () => {
      jest.spyOn(service as any, 'findUser').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      resetLogRepo.save.mockResolvedValue({} as any);

      await expect(
        service.changePassword(mockUser, 'wrongOld', 'newPass', '127.0.0.1'),
      ).rejects.toThrow(BadRequestException);

      expect(resetLogRepo.save).toHaveBeenCalledTimes(1); // failed log
    });

    it('should throw NotFoundException if user not found', async () => {
      jest
        .spyOn(service as any, 'findUser')
        .mockRejectedValue(new NotFoundException());

      await expect(
        service.changePassword(mockUser, 'old', 'newPass'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
