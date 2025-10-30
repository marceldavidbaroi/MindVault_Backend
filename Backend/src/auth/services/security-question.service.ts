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

  // ------------------- PASSWORD VERIFICATION -------------------
  private async verifyPassword(user: User, password: string): Promise<void> {
    const currentUser = await this.userRepository.findOne({
      where: { id: user.id },
    });
    if (!currentUser) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(password, currentUser.password);
    if (!isMatch) throw new BadRequestException('Invalid password');
  }

  // ------------------- SECURITY QUESTIONS -------------------
  async getSecurityQuestions(user: User): Promise<UserSecurityQuestion[]> {
    return this.questionsRepository.find({ where: { user: { id: user.id } } });
  }

  // Create a new security question
  async createSecurityQuestion(
    user: User,
    question: string,
    answer: string,
    password: string,
  ): Promise<any> {
    await this.verifyPassword(user, password);

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

  // Update an existing security question
  async updateSecurityQuestion(
    user: User,
    questionId: number,
    question: string,
    answer: string,
    password: string,
  ): Promise<UserSecurityQuestion> {
    await this.verifyPassword(user, password);

    const questionEntity = await this.questionsRepository.findOne({
      where: { id: questionId, user: { id: user.id } },
    });
    if (!questionEntity) throw new NotFoundException('Question not found');

    questionEntity.question = question;
    questionEntity.answerHash = await bcrypt.hash(answer, 10);
    return this.questionsRepository.save(questionEntity);
  }

  // Delete a security question
  async deleteSecurityQuestion(
    user: User,
    questionId: number,
    password: string,
  ): Promise<void> {
    await this.verifyPassword(user, password);

    const questionEntity = await this.questionsRepository.findOne({
      where: { id: questionId, user: { id: user.id } },
    });
    if (!questionEntity) throw new NotFoundException('Question not found');

    await this.questionsRepository.remove(questionEntity);
  }
}
