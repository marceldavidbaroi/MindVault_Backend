// constants/transaction-audit.constants.ts
export const AUDIT_ACTION = {
  CREATE: 'create',
  UPDATE: 'update',
  STATUS_CHANGE: 'status_change',
  DELETE: 'delete',
  VOID: 'void',
} as const;

export type AuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];
