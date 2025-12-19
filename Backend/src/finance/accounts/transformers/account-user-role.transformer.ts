import { AccountUserRole } from '../entity/account-user-role.entity';

export class AccountUserRoleTransformer {
  /** Return single entity as accountId (number) */
  static toAccountId(entity: AccountUserRole): number {
    return entity.accountId;
  }

  /** Return a unique array of account IDs as numbers */
  static toAccountIdArray(list: AccountUserRole[]): number[] {
    if (!list || list.length === 0) return [];
    const ids = list.map((entity) => entity.accountId);
    return [...new Set(ids)];
  }

  /** * Transforms the full entity to a clean response
   * excluding createdAt and updatedAt
   */
  static toResponse(entity: AccountUserRole) {
    return {
      id: entity.id,
      accountId: entity.accountId,
      userId: entity.userId,
      roleId: entity.roleId,
      role: entity.role
        ? {
            id: entity.role.id,
            name: entity.role.name,
            displayName: entity.role.displayName,
            description: entity.role.description,
            isSystem: entity.role.isSystem,
          }
        : null,
    };
  }

  /** Transforms a list of entities into clean responses */
  static toResponseList(list: AccountUserRole[]) {
    if (!list) return [];
    return list.map((item) => this.toResponse(item));
  }
}
