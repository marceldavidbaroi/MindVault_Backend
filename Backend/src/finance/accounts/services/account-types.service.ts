import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountType } from '../entity/account-type.entity';

@Injectable()
export class AccountTypesService {
  constructor(
    @InjectRepository(AccountType)
    private readonly accountTypeRepo: Repository<AccountType>,
  ) {}

  async listAccountTypes(): Promise<AccountType[]> {
    return await this.accountTypeRepo.find({ where: { isActive: true } });
  }
}
