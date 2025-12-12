// passwordResetLog.repository.ts
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PasswordResetLog } from '../entity/passwordResetLog.entity';

@Injectable()
export class PasswordResetLogRepository {
  constructor(
    @InjectRepository(PasswordResetLog)
    private readonly repo: Repository<PasswordResetLog>,
  ) {}

  createResetLog(data: Partial<PasswordResetLog>) {
    return this.repo.create(data);
  }

  saveResetLog(log: PasswordResetLog) {
    return this.repo.save(log);
  }
}
