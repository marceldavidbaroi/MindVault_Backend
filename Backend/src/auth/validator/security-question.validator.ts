import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../entity/user.entity';
import { UserSecurityQuestion } from '../entity/userSecurityQuestion.entity';

@Injectable()
export class SecurityQuestionValidator {
  async verifyPassword(user: User, password: string) {
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new BadRequestException('Invalid password');
  }

  ensureQuestionExists(
    question: UserSecurityQuestion | undefined,
  ): UserSecurityQuestion {
    if (!question) {
      throw new NotFoundException('Security question not found');
    }
    return question;
  }

  async checkQuestionLimit(count: number, max = 3) {
    if (count >= max)
      throw new BadRequestException(`Maximum ${max} questions allowed`);
  }
}
