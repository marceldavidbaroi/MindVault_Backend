import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountLogRepository } from '../repository/account-log.repository';

@Injectable()
export class AccountLogValidator {
  constructor(private readonly repository: AccountLogRepository) {}

  async ensureExists(id: number) {
    const log = await this.repository.findOne({ where: { id } });
    if (!log) throw new NotFoundException(`Account log ${id} not found`);
    return log;
  }
}
