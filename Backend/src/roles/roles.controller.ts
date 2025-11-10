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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
} from '@nestjs/swagger';
import { Role } from './role.entity';
import { ApiResponse } from 'src/common/types/api-response.type';

@ApiTags('Roles')
@UseGuards(AuthGuard('jwt'))
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  //   @Post()
  //   @ApiOperation({ summary: 'Create a new role' })
  //   @SwaggerResponse({ status: 201, description: 'Role created successfully.' })
  //   async create(@Body() dto: CreateRoleDto): Promise<Role> {
  //     return this.rolesService.create(dto);
  //   }
  @Get()
  @ApiOperation({ summary: 'List all roles' })
  @SwaggerResponse({ status: 200, description: 'Roles fetched successfully.' })
  async findAll(): Promise<ApiResponse<Role[]>> {
    const roles = await this.rolesService.findAll();
    return {
      success: true,
      message: 'Roles fetched successfully.',
      data: roles,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single role' })
  @SwaggerResponse({ status: 200, description: 'Role fetched successfully.' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<Role>> {
    const role = await this.rolesService.findOne(id);
    return {
      success: true,
      message: 'Role fetched successfully.',
      data: role,
    };
  }

  //   @Put(':id')
  //   @ApiOperation({ summary: 'Update a role' })
  //   @SwaggerResponse({ status: 200, description: 'Role updated successfully.' })
  //   async update(
  //     @Param('id', ParseIntPipe) id: number,
  //     @Body() dto: UpdateRoleDto,
  //   ): Promise<Role> {
  //     return this.rolesService.update(id, dto);
  //   }

  //   @Delete(':id')
  //   @ApiOperation({ summary: 'Delete a role' })
  //   @SwaggerResponse({ status: 200, description: 'Role deleted successfully.' })
  //   async remove(@Param('id', ParseIntPipe) id: number) {
  //     return this.rolesService.remove(id);
  //   }
}
