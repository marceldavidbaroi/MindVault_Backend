import { EntityRepository, Repository } from 'typeorm';
import { AccountUserRole } from '../entity/account-user-role.entity';

@EntityRepository(AccountUserRole)
export class AccountUserRoleRepository extends Repository<AccountUserRole> {
  findByUser(userId: number, roleId?: number) {
    return this.find({
      where: {
        userId,
        ...(roleId ? { roleId } : {}),
      },
    });
  }

  findByAccount(accountId: number) {
    return this.find({ where: { accountId } });
  }

  findOneByAccountAndUser(accountId: number, userId: number) {
    return this.findOne({ where: { accountId, userId } });
  }
}
