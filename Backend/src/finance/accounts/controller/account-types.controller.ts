import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AccountTypesService } from '../services/account-types.service';

@ApiTags('Finance Account Types')
@UseGuards(AuthGuard('jwt'))
@Controller('finance/account-types')
export class AccountTypesController {
  constructor(private readonly accountTypesService: AccountTypesService) {}

  // ---------- List all active account types ----------
  @Get('/all')
  @ApiOperation({ summary: 'List all active account types' })
  @SwaggerResponse({
    status: 200,
    description: 'Account types fetched successfully.',
  })
  async listAccountTypes() {
    return this.accountTypesService.listAccountTypes();
  }

  // ---------- Get a single account type by ID ----------
  @Get(':id')
  @ApiOperation({ summary: 'Get a single account type by ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Account type fetched successfully.',
  })
  async getAccountType(@Param('id', ParseIntPipe) id: number) {
    return this.accountTypesService.getAccountType(id);
  }
}
