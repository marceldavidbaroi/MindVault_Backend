import { Injectable } from '@nestjs/common';
import { TransactionAuditLog } from '../entity/transaction-audit-log.entity.ts';

@Injectable()
export class TransactionAuditLogTransformer {
  transform(log: TransactionAuditLog) {
    return {
      id: log.id,
      transactionId: log.transactionId,
      action: log.action,
      actor: log.actorSnapshot?.name || 'System',
      reason: log.reason,
      timestamp: log.createdAt,
      // Payloads included only for detailed view usually
      changes: {
        from: log.payloadBefore,
        to: log.payloadAfter,
      },
    };
  }

  transformMany(logs: TransactionAuditLog[]) {
    return logs.map((log) => this.transform(log));
  }
}
