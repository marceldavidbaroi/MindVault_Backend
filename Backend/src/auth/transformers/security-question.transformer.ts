import { Injectable } from '@nestjs/common';
import { UserSecurityQuestion } from '../entity/userSecurityQuestion.entity';

@Injectable()
export class SecurityQuestionTransformer {
  toPublicQuestion(q: UserSecurityQuestion) {
    const { id, question, createdAt, updatedAt, user } = q;
    return {
      id,
      question,
      createdAt,
      updatedAt,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }
}
