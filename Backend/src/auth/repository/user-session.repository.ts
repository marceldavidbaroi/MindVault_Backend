// userSession.repository.ts
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSession } from '../entity/userSessions.entity';

@Injectable()
export class UserSessionRepository {
  constructor(
    @InjectRepository(UserSession)
    private readonly repo: Repository<UserSession>,
  ) {}

  createSession(data: Partial<UserSession>) {
    return this.repo.create(data);
  }

  saveSession(session: UserSession) {
    return this.repo.save(session);
  }

  findSessionByUserId(userId: number) {
    return this.repo.findOne({ where: { user: { id: userId } } });
  }

  deleteSessions(userId: number) {
    return this.repo.delete({ user: { id: userId } });
  }

  deleteSessionByRefresh(hashedToken: string) {
    return this.repo.delete({ refreshToken: hashedToken });
  }
}
