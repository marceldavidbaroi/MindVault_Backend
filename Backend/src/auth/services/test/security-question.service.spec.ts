import { Test, TestingModule } from '@nestjs/testing';
import { SecurityQuestionService } from '../security-question.service';
import { VerifyUserService } from '../verify-user.service';
import { User } from '../../entities/user.entity';
import { UserSecurityQuestion } from '../../entities/userSecurityQuestion.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  count: jest.fn(),
  remove: jest.fn(),
});

const mockVerifyUserService = () => ({
  verify: jest.fn(),
});

describe('SecurityQuestionService', () => {
  let service: SecurityQuestionService;
  let userRepo: jest.Mocked<Repository<User>>;
  let questionsRepo: jest.Mocked<Repository<UserSecurityQuestion>>;
  let verifyUserService: jest.Mocked<VerifyUserService>;

  const mockUser: User = {
    id: 1,
    username: 'user1',
    email: 'user1@example.com',
    password: 'hashedPassword',
    hasSecurityQuestions: false,
  } as any;

  const mockQuestion: UserSecurityQuestion = {
    id: 10,
    question: 'Q1?',
    answerHash: 'hashedAnswer',
    user: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecurityQuestionService,
        { provide: getRepositoryToken(User), useFactory: mockRepository },
        {
          provide: getRepositoryToken(UserSecurityQuestion),
          useFactory: mockRepository,
        },
        { provide: VerifyUserService, useFactory: mockVerifyUserService },
      ],
    }).compile();

    service = module.get<SecurityQuestionService>(SecurityQuestionService);
    userRepo = module.get(getRepositoryToken(User));
    questionsRepo = module.get(getRepositoryToken(UserSecurityQuestion));
    verifyUserService = module.get(VerifyUserService);

    jest.clearAllMocks();
  });

  // ---------------- GET SECURITY QUESTIONS ----------------
  describe('getSecurityQuestions', () => {
    it('should return security questions for a user', async () => {
      verifyUserService.verify.mockResolvedValue(mockUser);
      questionsRepo.find.mockResolvedValue([mockQuestion]);

      const result = await service.getSecurityQuestions(mockUser.id);
      expect(result).toEqual([mockQuestion]);
      expect(questionsRepo.find).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id } },
      });
    });
  });

  // ---------------- CREATE SECURITY QUESTION ----------------
  describe('createSecurityQuestion', () => {
    it('should create a new security question', async () => {
      verifyUserService.verify.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewAnswer');
      questionsRepo.count.mockResolvedValue(0);
      questionsRepo.create.mockReturnValue(mockQuestion);
      questionsRepo.save.mockResolvedValue(mockQuestion);
      userRepo.save.mockResolvedValue({
        ...mockUser,
        hasSecurityQuestions: true,
      } as DeepPartial<User> & User);

      const result = await service.createSecurityQuestion(
        mockUser.id,
        'Q1?',
        'answer',
        'hashedPassword',
      );

      expect(result.id).toBe(mockQuestion.id);
      expect(result.user.id).toBe(mockUser.id);
      expect(questionsRepo.create).toHaveBeenCalled();
      expect(userRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ hasSecurityQuestions: true }),
      );
    });

    it('should throw BadRequestException if more than 3 questions', async () => {
      verifyUserService.verify.mockResolvedValue(mockUser);
      questionsRepo.count.mockResolvedValue(3);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        service.createSecurityQuestion(mockUser.id, 'Q4?', 'ans', 'pass'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password incorrect', async () => {
      verifyUserService.verify.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.createSecurityQuestion(mockUser.id, 'Q?', 'ans', 'wrong'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ---------------- UPDATE SECURITY QUESTION ----------------
  describe('updateSecurityQuestion', () => {
    it('should update question and answer', async () => {
      verifyUserService.verify.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      questionsRepo.findOne.mockResolvedValue(mockQuestion);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashed');

      // Mock save to return the updated entity
      questionsRepo.save.mockImplementation(
        async (entity) =>
          ({
            ...entity,
            id: entity.id ?? 1, // ensure id exists
            user: entity.user ?? mockUser,
            createdAt: entity.createdAt ?? new Date(),
            updatedAt: entity.updatedAt ?? new Date(),
          }) as UserSecurityQuestion,
      );
      const result = await service.updateSecurityQuestion(
        mockUser.id,
        mockQuestion.id,
        'New Q?',
        'newAnswer',
        'hashedPassword',
      );

      expect(result.question).toBe('New Q?');
      expect(result.answerHash).toBe('newHashed');
      expect(questionsRepo.save).toHaveBeenCalledWith(mockQuestion);
    });

    it('should throw NotFoundException if question does not exist', async () => {
      verifyUserService.verify.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      questionsRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateSecurityQuestion(mockUser.id, 999, 'Q?', 'ans', 'pass'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if password incorrect', async () => {
      verifyUserService.verify.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.updateSecurityQuestion(
          mockUser.id,
          mockQuestion.id,
          'Q?',
          'ans',
          'wrong',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ---------------- DELETE SECURITY QUESTION ----------------
  describe('deleteSecurityQuestion', () => {
    it('should delete a security question and update user flag if last question', async () => {
      verifyUserService.verify.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      questionsRepo.findOne.mockResolvedValue(mockQuestion);
      questionsRepo.count.mockResolvedValue(0);
      userRepo.save.mockResolvedValue({
        ...mockUser,
        hasSecurityQuestions: false,
      } as DeepPartial<User> & User);
      questionsRepo.remove.mockResolvedValue(mockQuestion);

      await service.deleteSecurityQuestion(
        mockUser.id,
        mockQuestion.id,
        'hashedPassword',
      );

      expect(questionsRepo.remove).toHaveBeenCalledWith(mockQuestion);
      expect(userRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ hasSecurityQuestions: false }),
      );
    });

    it('should throw NotFoundException if question does not exist', async () => {
      verifyUserService.verify.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      questionsRepo.findOne.mockResolvedValue(null);

      await expect(
        service.deleteSecurityQuestion(mockUser.id, 999, 'hashedPassword'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if password incorrect', async () => {
      verifyUserService.verify.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.deleteSecurityQuestion(
          mockUser.id,
          mockQuestion.id,
          'wrongPass',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
