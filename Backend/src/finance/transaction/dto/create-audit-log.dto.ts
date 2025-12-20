// dto/create-transaction-audit-log.dto.ts
import { IsInt, IsOptional, IsString, IsIn, IsJSON } from 'class-validator';

export class CreateTransactionAuditLogDto {
  @IsInt()
  transactionId: number;

  @IsInt()
  actorId: number;

  @IsJSON()
  actorSnapshot: any;

  @IsIn(['create', 'update', 'status_change', 'delete', 'void'])
  action: 'create' | 'update' | 'status_change' | 'delete' | 'void';

  @IsOptional()
  @IsJSON()
  payloadBefore?: any;

  @IsOptional()
  @IsJSON()
  payloadAfter?: any;

  @IsOptional()
  @IsString()
  reason: string;
}
