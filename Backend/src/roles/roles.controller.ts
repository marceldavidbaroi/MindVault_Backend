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
  async findAll(): Promise<Role[]> {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single role' })
  @SwaggerResponse({ status: 200, description: 'Role fetched successfully.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Role> {
    return this.rolesService.findOne(id);
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
