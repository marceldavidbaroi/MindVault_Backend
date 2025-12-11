import { Test, TestingModule } from '@nestjs/testing';
import { ForgotPasswordService } from '../forgot-password.service';
import { VerifyUserService } from '../verify-user.service';
import { User } from '../../entity/user.entity';
import { UserSecurityQuestion } from '../../entity/userSecurityQuestion.entity';
import { PasswordResetLog } from '../../entity/passwordResetLog.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
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
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockVerifyUserService = () => ({
  verify: jest.fn(),
});

// --------------------- TEST SUITE ---------------------
describe('ForgotPasswordService', () => {
  let service: ForgotPasswordService;
  let userRepo: jest.Mocked<Repository<User>>;
  let questionRepo: jest.Mocked<Repository<UserSecurityQuestion>>;
  let resetLogRepo: jest.Mocked<Repository<PasswordResetLog>>;
  let verifyUserService: jest.Mocked<VerifyUserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForgotPasswordService,
        { provide: getRepositoryToken(User), useFactory: mockRepository },
        {
          provide: getRepositoryToken(UserSecurityQuestion),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(PasswordResetLog),
          useFactory: mockRepository,
        },
        { provide: VerifyUserService, useFactory: mockVerifyUserService },
      ],
    }).compile();

    service = module.get(ForgotPasswordService);
    userRepo = module.get(getRepositoryToken(User));
    questionRepo = module.get(getRepositoryToken(UserSecurityQuestion));
    resetLogRepo = module.get(getRepositoryToken(PasswordResetLog));
    verifyUserService = module.get(VerifyUserService);

    jest.clearAllMocks();
  });

  // ------------------- fetchForgotQuestions -------------------
  describe('fetchForgotQuestions', () => {
    it('should return questions for a user', async () => {
      const mockUser = { id: 1 } as User;
      const questions = [
        { id: 10, question: 'Q1', user: mockUser } as UserSecurityQuestion,
      ];

      verifyUserService.verify.mockResolvedValue(mockUser);
      questionRepo.find.mockResolvedValue(questions);

      const result = await service.fetchForgotQuestions('testuser');
      expect(result).toEqual([{ id: 10, question: 'Q1' }]);
      expect(verifyUserService.verify).toHaveBeenCalledWith('testuser');
    });

    it('should return empty array if user has no questions', async () => {
      const mockUser = { id: 1 } as User;
      verifyUserService.verify.mockResolvedValue(mockUser);
      questionRepo.find.mockResolvedValue([]);

      const result = await service.fetchForgotQuestions('testuser');
      expect(result).toEqual([]);
    });

    it('should throw if user not found', async () => {
      verifyUserService.verify.mockRejectedValue(new NotFoundException());
      await expect(service.fetchForgotQuestions('notfound')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ------------------- verifyForgotAnswers -------------------
  describe('verifyForgotAnswers', () => {
    const newPassword = 'newPass123';
    const passkeyMock = 'new-passkey';
    (generatePasskey as jest.Mock).mockReturnValue(passkeyMock);

    it('should reset password if all answers are correct', async () => {
      const mockUser = { id: 1 } as User;
      const questions = [
        { id: 1, answerHash: 'hashed1' } as UserSecurityQuestion,
      ];
      const answers = [{ questionId: 1, answer: 'correct' }];

      verifyUserService.verify.mockResolvedValue(mockUser);
      questionRepo.find.mockResolvedValue(questions);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      userRepo.save.mockResolvedValue(mockUser);
      resetLogRepo.create.mockReturnValue({} as PasswordResetLog);
      resetLogRepo.save.mockResolvedValue({} as PasswordResetLog);

      const result = await service.verifyForgotAnswers(
        'user1',
        answers,
        newPassword,
      );
      expect(result).toEqual({
        message: 'Password reset successful',
        newPasskey: passkeyMock,
      });
      expect(userRepo.save).toHaveBeenCalledTimes(1);
      expect(resetLogRepo.save).toHaveBeenCalledTimes(1);
      expect(bcrypt.compare).toHaveBeenCalledWith('correct', 'hashed1');
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
    });

    it('should throw BadRequestException if questionId invalid', async () => {
      const mockUser = { id: 1 } as User;
      verifyUserService.verify.mockResolvedValue(mockUser);
      questionRepo.find.mockResolvedValue([
        { id: 2, answerHash: 'hashed' } as UserSecurityQuestion,
      ]);

      const answers = [{ questionId: 99, answer: 'ans' }];
      await expect(
        service.verifyForgotAnswers('user1', answers, newPassword),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if answer incorrect', async () => {
      const mockUser = { id: 1 } as User;
      const questions = [
        { id: 1, answerHash: 'hashed' } as UserSecurityQuestion,
      ];
      verifyUserService.verify.mockResolvedValue(mockUser);
      questionRepo.find.mockResolvedValue(questions);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const answers = [{ questionId: 1, answer: 'wrong' }];
      await expect(
        service.verifyForgotAnswers('user1', answers, newPassword),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      verifyUserService.verify.mockRejectedValue(new NotFoundException());
      const answers = [{ questionId: 1, answer: 'ans' }];
      await expect(
        service.verifyForgotAnswers('notfound', answers, newPassword),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
