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

@Injectable()
export class SecurityQuestionService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSecurityQuestion)
    private readonly questionsRepository: Repository<UserSecurityQuestion>,
  ) {}

  // ------------------- SECURITY QUESTIONS -------------------
  async getSecurityQuestions(user: User): Promise<UserSecurityQuestion[]> {
    return this.questionsRepository.find({ where: { user: { id: user.id } } });
  }

  async createSecurityQuestion(
    user: User,
    question: string,
    answer: string,
  ): Promise<any> {
    const currentUser = await this.userRepository.findOne({
      where: { id: user.id },
    });
    if (!currentUser) throw new NotFoundException('User not found');

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
    user: User,
    questionId: number,
    question: string,
    answer: string,
  ): Promise<UserSecurityQuestion> {
    const questionEntity = await this.questionsRepository.findOne({
      where: { id: questionId, user: { id: user.id } },
    });
    if (!questionEntity) throw new NotFoundException('Question not found');

    questionEntity.question = question;
    questionEntity.answerHash = await bcrypt.hash(answer, 10);
    return this.questionsRepository.save(questionEntity);
  }

  async deleteSecurityQuestion(user: User, questionId: number): Promise<void> {
    const questionEntity = await this.questionsRepository.findOne({
      where: { id: questionId, user: { id: user.id } },
    });
    if (!questionEntity) throw new NotFoundException('Question not found');

    await this.questionsRepository.remove(questionEntity);
  }
}
