import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserSecurityQuestion } from '../entities/userSecurityQuestion.entity';
import { PasswordResetLog } from '../entities/passwordResetLog.entity';
import { generatePasskey } from '../utils/passkey.util';
import { VerifyUserService } from './verify-user.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class ForgotPasswordService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly verifyUserService: VerifyUserService,

    @InjectRepository(UserSecurityQuestion)
    private readonly questionsRepository: Repository<UserSecurityQuestion>,

    @InjectRepository(PasswordResetLog)
    private readonly resetLogRepository: Repository<PasswordResetLog>,
  ) {}

  // ------------------- FORGOT PASSWORD -------------------
  async fetchForgotQuestions(
    username: string,
  ): Promise<{ id: number; question: string }[]> {
    const user = await this.verifyUserService.verify(username);

    const questions = await this.questionsRepository.find({
      where: { user: { id: user.id } },
    });

    return questions.map((q) => ({ id: q.id, question: q.question }));
  }

  async verifyForgotAnswers(
    username: string,
    answers: { questionId: number; answer: string }[],
    newPassword: string,
  ): Promise<{ message: string; newPasskey: string }> {
    const user = await this.verifyUserService.verify(username);

    const questions = await this.questionsRepository.find({
      where: { user: { id: user.id } },
    });

    for (const ans of answers) {
      const q = questions.find((q) => q.id === ans.questionId);
      if (!q) throw new BadRequestException('Invalid question ID');

      const match = await bcrypt.compare(ans.answer, q.answerHash);
      if (!match)
        throw new BadRequestException('Incorrect answer for a question');
    }

    // ✅ All correct, reset password
    user.password = await bcrypt.hash(newPassword, 10);
    const newPasskey = generatePasskey();
    user.passkey = newPasskey;
    user.passkeyExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    user.refreshToken = undefined;

    await this.userRepository.save(user); // or user.save() if using ActiveRecord

    // Log reset
    const resetLog = this.resetLogRepository.create({
      user,
      method: 'security_questions',
      success: true,
    });
    await this.resetLogRepository.save(resetLog);

    return { message: 'Password reset successful', newPasskey };
  }
}
