import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { UserSecurityQuestion } from '../entities/userSecurityQuestion.entity';
import { VerifyUserService } from './verify-user.service';

@Injectable()
export class SecurityQuestionService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly verifyUserService: VerifyUserService,
    @InjectRepository(UserSecurityQuestion)
    private readonly questionsRepository: Repository<UserSecurityQuestion>,
  ) {}

  // ------------------- PASSWORD VERIFICATION -------------------
  private async verifyPassword(
    userId: number,
    password: string,
  ): Promise<void> {
    const currentUser = await this.verifyUserService.verify(userId);

    const isMatch = await bcrypt.compare(password, currentUser.password);
    if (!isMatch) throw new BadRequestException('Invalid password');
  }

  // ------------------- SECURITY QUESTIONS -------------------
  async getSecurityQuestions(userId: number): Promise<UserSecurityQuestion[]> {
    await this.verifyUserService.verify(userId);
    return this.questionsRepository.find({ where: { user: { id: userId } } });
  }

  async createSecurityQuestion(
    userId: number,
    question: string,
    answer: string,
    password: string,
  ): Promise<any> {
    const user = await this.verifyUserService.verify(userId);
    await this.verifyPassword(user.id, password);

    const count = await this.questionsRepository.count({
      where: { user: { id: user.id } },
    });
    if (count >= 3)
      throw new BadRequestException('Maximum 3 questions allowed');

    const hashedAnswer = await bcrypt.hash(answer, 10);
    const newQuestion = this.questionsRepository.create({
      user,
      question,
      answerHash: hashedAnswer,
    });
    const saved = await this.questionsRepository.save(newQuestion);

    if (!user.hasSecurityQuestions) {
      user.hasSecurityQuestions = true;
      await this.userRepository.save(user);
    }

    const { id, username, email } = saved.user;
    return {
      id: saved.id,
      user: { id, username, email },
      question: saved.question,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }

  async updateSecurityQuestion(
    userId: number,
    questionId: number,
    question: string,
    answer: string,
    password: string,
  ): Promise<UserSecurityQuestion> {
    await this.verifyPassword(userId, password);

    const questionEntity = await this.questionsRepository.findOne({
      where: { id: questionId, user: { id: userId } },
    });
    if (!questionEntity) throw new NotFoundException('Question not found');

    questionEntity.question = question;
    questionEntity.answerHash = await bcrypt.hash(answer, 10);
    return this.questionsRepository.save(questionEntity);
  }

  async deleteSecurityQuestion(
    userId: number,
    questionId: number,
    password: string,
  ): Promise<void> {
    await this.verifyPassword(userId, password);

    const questionEntity = await this.questionsRepository.findOne({
      where: { id: questionId, user: { id: userId } },
    });
    if (!questionEntity) throw new NotFoundException('Question not found');

    await this.questionsRepository.remove(questionEntity);

    const remaining = await this.questionsRepository.count({
      where: { user: { id: userId } },
    });
    if (remaining === 0) {
      const user = await this.verifyUserService.verify(userId);
      if (user.hasSecurityQuestions) {
        user.hasSecurityQuestions = false;
        await this.userRepository.save(user);
      }
    }
  }
}
