import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SecurityQuestionValidator } from '../validator/security-question.validator';
import { UserValidator } from '../validator/user.validator';
import { UserSecurityQuestionRepository } from '../repository/user-security-question.repository';
import { SecurityQuestionTransformer } from '../transformers/security-question.transformer';
import { UserRepository } from '../repository/user.repository';
import { UserAuthValidator } from '../validator/user-auth.validator';

@Injectable()
export class SecurityQuestionService {
  constructor(
    private readonly validator: SecurityQuestionValidator,
    private readonly userAuthValidator: UserAuthValidator,
    private readonly securityQuestionRepo: UserSecurityQuestionRepository,
    private readonly securityQuestionTransformer: SecurityQuestionTransformer,
    private readonly userRepository: UserRepository,
  ) {}

  // -------------------------------------------------------
  // GET QUESTIONS
  // -------------------------------------------------------
  async getSecurityQuestions(userId: number) {
    await this.userAuthValidator.ensureUserExistsForLogin(userId);

    const questions =
      await this.securityQuestionRepo.findQuestionsByUserId(userId);

    const transformed = questions.map((q) =>
      this.securityQuestionTransformer.toPublicQuestion(q),
    );

    return {
      success: true,
      message: 'Security questions retrieved successfully.',
      data: transformed,
    };
  }

  // -------------------------------------------------------
  // CREATE QUESTION
  // -------------------------------------------------------
  async createSecurityQuestion(
    userId: number,
    question: string,
    answer: string,
    password: string,
  ) {
    const user = await this.userAuthValidator.ensureUserExistsForLogin(userId);

    await this.validator.verifyPassword(user, password);

    const count = await this.securityQuestionRepo.countQuestionsByUser(userId);
    await this.validator.checkQuestionLimit(count);

    const hashedAnswer = await bcrypt.hash(answer, 10);

    const questionEntity = this.securityQuestionRepo.createQuestion({
      user,
      question,
      answerHash: hashedAnswer,
    });

    const saved = await this.securityQuestionRepo.saveQuestion(questionEntity);

    if (!user.hasSecurityQuestions) {
      user.hasSecurityQuestions = true;
      await this.userRepository.saveUser(user);
    }

    return {
      success: true,
      message: 'Security question created successfully.',
      data: this.securityQuestionTransformer.toPublicQuestion(saved),
    };
  }

  // -------------------------------------------------------
  // UPDATE QUESTION
  // -------------------------------------------------------
  async updateSecurityQuestion(
    userId: number,
    questionId: number,
    question: string,
    answer: string,
    password: string,
  ) {
    const user = await this.userAuthValidator.ensureUserExistsForLogin(userId);
    await this.validator.verifyPassword(user, password);

    const questionEntity = this.validator.ensureQuestionExists(
      await this.securityQuestionRepo.findQuestionById(questionId, userId),
    );
    // ensureQuestionExists throws if not found
    this.validator.ensureQuestionExists(questionEntity);

    questionEntity.question = question;
    questionEntity.answerHash = await bcrypt.hash(answer, 10);

    const updated =
      await this.securityQuestionRepo.saveQuestion(questionEntity);

    return {
      success: true,
      message: 'Security question updated successfully.',
      data: this.securityQuestionTransformer.toPublicQuestion(updated),
    };
  }

  // -------------------------------------------------------
  // DELETE QUESTION
  // -------------------------------------------------------
  async deleteSecurityQuestion(
    userId: number,
    questionId: number,
    password: string,
  ) {
    const user = await this.userAuthValidator.ensureUserExistsForLogin(userId);
    await this.validator.verifyPassword(user, password);

    const questionEntity = this.validator.ensureQuestionExists(
      await this.securityQuestionRepo.findQuestionById(questionId, userId),
    );

    this.validator.ensureQuestionExists(questionEntity);

    await this.securityQuestionRepo.removeQuestion(questionEntity);

    const remaining =
      await this.securityQuestionRepo.countQuestionsByUser(userId);

    if (remaining === 0 && user.hasSecurityQuestions) {
      user.hasSecurityQuestions = false;
      await this.userRepository.saveUser(user);
    }

    return {
      success: true,
      message: 'Security question deleted successfully.',
    };
  }
}
