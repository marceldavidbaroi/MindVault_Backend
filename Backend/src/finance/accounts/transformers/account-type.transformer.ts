import { AccountType } from '../entity/account-type.entity';

export class AccountTypeTransformer {
  static toResponse(accountType: AccountType) {
    return {
      id: accountType.id,
      name: accountType.name,
      description: accountType.description,
      isActive: accountType.isActive,
      scope: accountType.scope,
    };
  }

  static toResponseList(accountTypes: AccountType[]) {
    return accountTypes.map((type) => this.toResponse(type));
  }
}
