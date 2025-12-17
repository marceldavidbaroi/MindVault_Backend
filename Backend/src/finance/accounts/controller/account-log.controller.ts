import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AccountLogService } from '../services/account-log.service';
import { ApiResponse } from 'src/common/types/api-response.type';
import { AccountLogQueryDto } from '../dto/account-log-query.dto';

@ApiTags('Account Logs')
@UseGuards(AuthGuard('jwt'))
@Controller('finance/account-logs')
export class AccountLogController {
  constructor(private readonly logService: AccountLogService) {}

  @Get('account/:accountId')
  @ApiOperation({ summary: 'Get all logs for an account' })
  @SwaggerResponse({
    status: 200,
    description: 'Account logs fetched successfully',
  })
  @Get(':accountId')
  @ApiOperation({
    summary: 'List logs for an account with pagination and filters',
  })
  async listByAccount(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query() query: AccountLogQueryDto,
  ) {
    const relations = query.relations ? query.relations.split(',') : [];
    const actions = query.actions ? query.actions.split(',') : undefined;

    return this.logService.listByAccount(
      accountId,
      query.page,
      query.limit,
      actions,
      query.order,
      relations,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single account log by ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Account log fetched successfully',
  })
  async getLog(
    @Param('id', ParseIntPipe) id: number,
    @Query('relations') relations?: string,
  ): Promise<ApiResponse<any>> {
    const relationArray = relations ? relations.split(',') : [];
    return this.logService.get(id, relationArray);
  }
}
