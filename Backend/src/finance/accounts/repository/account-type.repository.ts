import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { AccountType } from '../entity/account-type.entity';

@Injectable()
export class AccountTypeRepository extends Repository<AccountType> {
  constructor(private readonly dataSource: DataSource) {
    super(AccountType, dataSource.createEntityManager());
  }

  async truncate(): Promise<void> {
    await this.dataSource.query(
      `TRUNCATE TABLE account_types RESTART IDENTITY CASCADE;`,
    );
  }

  async saveMany(data: Partial<AccountType>[]): Promise<AccountType[]> {
    const entities = this.create(data);
    return this.save(entities);
  }

  async findActive(): Promise<AccountType[]> {
    return this.find({
      select: ['id', 'name', 'description', 'isActive', 'scope'],
      where: { isActive: true },
    });
  }

  async findById(id: number): Promise<AccountType | null> {
    return this.findOne({ where: { id } });
  }
}
