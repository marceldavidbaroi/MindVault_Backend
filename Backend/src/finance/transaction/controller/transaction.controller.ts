// controller/transaction.controller.ts
import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TransactionService } from '../services/transaction.service';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { QueryTransactionDto } from '../dto/query-transaction.dto';

@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly service: TransactionService,
  ) {}

  @Post()
  create(@Body() dto: CreateTransactionDto) {
    const creatorId = dto['creatorId']; // replace with auth context

    return this.dataSource.transaction((manager) =>
      this.service.create(manager, dto, creatorId),
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.dataSource.transaction((manager) =>
      this.service.update(manager, id, dto),
    );
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.dataSource.transaction((manager) =>
      this.service.delete(manager, id),
    );
  }

  @Get()
  list(@Query() query: QueryTransactionDto) {
    return this.service.list(query);
  }
}
