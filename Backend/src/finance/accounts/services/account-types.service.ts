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

  async listAccountTypes(): Promise<any> {
    return await this.accountTypeRepo.find({
      select: ['id', 'name', 'description', 'isActive', 'scope'], // explicitly select only what you need
      where: { isActive: true },
    });
  }
}
