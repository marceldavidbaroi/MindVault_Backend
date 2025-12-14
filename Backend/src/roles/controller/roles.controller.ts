// src/roles/roles.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from '../services/roles.service';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
} from '@nestjs/swagger';
import { Role } from '../entity/role.entity';
import { ApiResponse } from 'src/common/types/api-response.type';
import { RoleResponseDto } from '../dto/role-response.dto';

@ApiTags('Roles')
@UseGuards(AuthGuard('jwt'))
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'List all roles' })
  @SwaggerResponse({ status: 200, description: 'Roles fetched successfully.' })
  async findAll(): Promise<ApiResponse<RoleResponseDto[]>> {
    return await this.rolesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single role' })
  @SwaggerResponse({ status: 200, description: 'Role fetched successfully.' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<RoleResponseDto>> {
    return await this.rolesService.findOne(id);
  }
}
