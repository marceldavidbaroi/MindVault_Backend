import { Injectable } from '@nestjs/common';
import { UserSecurityQuestion } from '../entity/userSecurityQuestion.entity';

@Injectable()
export class ForgotPasswordTransformer {
  questionsResponse(questions: UserSecurityQuestion[]) {
    return questions.map((q) => ({ id: q.id, question: q.question }));
  }
}
