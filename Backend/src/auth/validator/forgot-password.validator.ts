import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserSecurityQuestion } from '../entity/userSecurityQuestion.entity';

@Injectable()
export class ForgotPasswordValidator {
  async validateAnswers(
    provided: { questionId: number; answer: string }[],
    stored: UserSecurityQuestion[],
  ) {
    for (const ans of provided) {
      const q = stored.find((q) => q.id === ans.questionId);
      if (!q) throw new BadRequestException('Invalid question ID');

      const match = await bcrypt.compare(ans.answer, q.answerHash);
      if (!match)
        throw new BadRequestException('Incorrect answer for a question');
    }
    return true;
  }
}
