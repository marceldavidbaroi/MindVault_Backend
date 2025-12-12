import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { generatePasskey } from '../utils/passkey.util';
import { ForgotPasswordValidator } from '../validator/forgot-password.validator';
import { ForgotPasswordTransformer } from '../transformers/forgot-password.transformer';
import { UserValidator } from '../validator/user.validator';
import { UserSecurityQuestionRepository } from '../repository/user-security-question.repository';
import { hashString } from 'src/common/utils/hash.util';
import { UserRepository } from '../repository/user.repository';
import { PasswordResetLogRepository } from '../repository/password-reset-log.repository';

@Injectable()
export class ForgotPasswordService {
  constructor(
    private readonly securityQuestionRepo: UserSecurityQuestionRepository,
    private readonly validator: ForgotPasswordValidator,
    private readonly transformer: ForgotPasswordTransformer,
    private readonly userValidator: UserValidator,
    private readonly userRepo: UserRepository,
    private readonly passwordResetLogRepo: PasswordResetLogRepository,
  ) {}

  // ------------------- FETCH QUESTIONS -------------------
  async fetchForgotQuestions(username: string) {
    const user = await this.userValidator.ensureUserExists(username);

    const questions = await this.securityQuestionRepo.findQuestionsByUserId(
      user.id,
    );

    return {
      success: true,
      message: 'Security questions fetched successfully.',
      data: this.transformer.questionsResponse(questions),
    };
  }

  // ------------------- VERIFY ANSWERS & RESET -------------------
  async verifyForgotAnswers(
    username: string,
    answers: { questionId: number; answer: string }[],
    newPassword: string,
  ) {
    const user = await this.userValidator.ensureUserExists(username);
    const questions = await this.securityQuestionRepo.findQuestionsByUserId(
      user.id,
    );

    // Validate answers
    await this.validator.validateAnswers(answers, questions);

    // Reset password
    user.password = await hashString(newPassword);
    const newPasskey = generatePasskey();
    user.passkey = newPasskey;
    user.passkeyExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    user.refreshToken = undefined;

    await this.userRepo.saveUser(user);

    // Log reset
    const log = this.passwordResetLogRepo.createResetLog({
      user,
      method: 'security_questions',
      success: true,
    });
    await this.passwordResetLogRepo.saveResetLog(log);

    return { success: true, message: 'Password reset successful', newPasskey };
  }
}
