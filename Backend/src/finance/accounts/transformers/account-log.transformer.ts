import { AccountLog } from '../entity/account-log.entity';

export class AccountLogTransformer {
  static toResponse(log: AccountLog) {
    return {
      id: log.id,
      accountId: log.accountId,
      userId: log.userId,
      action: log.action,
      oldValue: log.oldValue,
      newValue: log.newValue,
      transactionId: log.transactionId,
      source: log.source,
      createdAt: log.createdAt,

      // Snapshots
      accountSnapshot: log.accountSnapshot ?? null,
      userSnapshot: log.userSnapshot ?? null,

      // Relations (optional)
      account: log.account
        ? {
            id: log.account.id,
            name: log.account.name,
            accountNumber: log.account.accountNumber,
            ownerId: log.account.ownerId,
            typeId: log.account.typeId,
            currencyCode: log.account.currencyCode,
            balance: log.account.balance,
          }
        : null,

      user: log.user
        ? {
            id: log.user.id,
            username: log.user.username,
            name: log.user.username,
            email: log.user.email,
          }
        : null,
    };
  }

  static toResponseList(logs: AccountLog[]) {
    return logs.map(this.toResponse);
  }
}
