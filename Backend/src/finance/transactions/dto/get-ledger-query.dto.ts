import { IsNumber } from 'class-validator';

export class GetAccountLedgerDto {
  @IsNumber()
  accountId: number;
}
