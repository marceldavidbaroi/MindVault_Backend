import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AccountLedgerService } from '../services/transaction-ledger.service';
import { AccountLedgerReversalService } from '../services/transaction-ledger-reversal.service';
import { CreateLedgerDto } from '../dto/create-ledger.dto';
import { UpdateLedgerDto } from '../dto/update-ledger.dto';
import { QueryLedgerDto } from '../dto/query-ledger.dto';
import { ApiResponse } from 'src/common/types/api-response.type';

@Controller('account-ledger')
export class AccountLedgerController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly ledgerService: AccountLedgerService,
    private readonly reversalService: AccountLedgerReversalService,
  ) {}

  /**
   * 📒 List ledger entries by ACCOUNT
   */
  @Get('account/:accountId')
  async listByAccount(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query() query: QueryLedgerDto,
  ): Promise<ApiResponse<any>> {
    return this.ledgerService.listByAccount(accountId, query);
  }

  /**
   * 👤 List ledger entries by USER (creator)
   */
  @Get('user/:userId')
  async listByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: QueryLedgerDto,
  ): Promise<ApiResponse<any>> {
    return this.ledgerService.listByUser(userId, query);
  }
}
