// userSecurityQuestion.repository.ts
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSecurityQuestion } from '../entity/userSecurityQuestion.entity';

@Injectable()
export class UserSecurityQuestionRepository {
  constructor(
    @InjectRepository(UserSecurityQuestion)
    private readonly repo: Repository<UserSecurityQuestion>,
  ) {}

  findQuestionsByUserId(userId: number) {
    return this.repo.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async findQuestionById(questionId: number, userId: number) {
    const result = await this.repo.findOne({
      where: { id: questionId, user: { id: userId } },
      relations: ['user'],
    });

    return result ?? undefined;
  }

  countQuestionsByUser(userId: number) {
    return this.repo.count({ where: { user: { id: userId } } });
  }

  createQuestion(data: Partial<UserSecurityQuestion>) {
    return this.repo.create(data);
  }

  saveQuestion(question: UserSecurityQuestion) {
    return this.repo.save(question);
  }

  removeQuestion(question: UserSecurityQuestion) {
    return this.repo.remove(question);
  }
}
