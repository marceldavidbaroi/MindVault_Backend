import { AccountUserRole } from '../entity/account-user-role.entity';

export class AccountUserRoleTransformer {
  /** Return single entity as accountId (number) */
  static toResponse(entity: AccountUserRole) {
    return entity.accountId;
  }

  /** Return list of accountIds as a comma-separated string */
  static toResponseList(list: AccountUserRole[]) {
    const ids = list.map((entity) => entity.accountId);
    return ids.join(','); // returns string like "1,2,3"
  }
}
