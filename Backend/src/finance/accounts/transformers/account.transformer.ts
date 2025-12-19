import { Account } from '../entity/account.entity';

export class AccountTransformer {
  // Single account full response
  static toResponse(account: Account) {
    return {
      id: account.id,
      name: account.name,
      description: account.description,
      initialBalance: account.initialBalance,
      balance: account.balance,
      typeId: account.typeId,
      ownerId: account.ownerId,
      currencyCode: account.currencyCode,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      type: account.type,
      owner: account.owner,
      currency: account.currency,
    };
  }

  // Single account for list (without timestamps)
  static toListItem(account: Account) {
    return {
      id: account.id,
      name: account.name,
      description: account.description,
      initialBalance: account.initialBalance,
      balance: account.balance,
      typeId: account.typeId,
      ownerId: account.ownerId,
      currencyCode: account.currencyCode,
      type: account.type,
      owner: account.owner,
      currency: account.currency,
    };
  }

  // List of accounts without timestamps
  static toResponseList(accounts: Account[]) {
    return accounts.map(this.toListItem);
  }
}
