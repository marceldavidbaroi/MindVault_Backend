import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UserRolesService } from './user-roles.service';
import { CreateUserRoleDto } from './dto/create-user-roles.dto';
import { UpdateUserRoleDto } from './dto/update-user-roles.dto';
import { FilterUserRoleDto } from './dto/filter-user-role.dto';
import { ApiResponse } from 'src/common/types/api-response.type';
import { UserRole } from './user-roles.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('user-roles')
@UseGuards(AuthGuard('jwt'))
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  /** CREATE */
  // @Post()
  // async create(
  //   @Body() createDto: CreateUserRoleDto,
  // ): Promise<ApiResponse<UserRole>> {
  //   try {
  //     const role = await this.userRolesService.create(createDto);
  //     return {
  //       success: true,
  //       message: 'User role created successfully',
  //       data: role,
  //     };
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       message:
  //         error.code === '23505'
  //           ? `Role "${createDto.name}" already exists`
  //           : error.message || 'Failed to create role',
  //       data: null,
  //     };
  //   }
  // }

  /** FIND ALL */
  @Get()
  async findAll(
    @Query() filterDto: FilterUserRoleDto,
  ): Promise<ApiResponse<UserRole[]>> {
    try {
      const roles = await this.userRolesService.findAll(filterDto);
      return {
        success: true,
        message: 'User roles fetched successfully',
        data: roles,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to fetch user roles',
        data: null,
      };
    }
  }

  /** FIND ONE */
  // @Get(':id')
  // async findOne(
  //   @Param('id', ParseIntPipe) id: number,
  // ): Promise<ApiResponse<UserRole>> {
  //   try {
  //     const role = await this.userRolesService.findOne(id);
  //     return {
  //       success: true,
  //       message: 'User role fetched successfully',
  //       data: role,
  //     };
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       message: error.message || 'Failed to fetch user role',
  //       data: null,
  //     };
  //   }
  // }

  /** UPDATE */
  // @Patch(':id')
  // async update(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() updateDto: UpdateUserRoleDto,
  // ): Promise<ApiResponse<UserRole>> {
  //   try {
  //     const role = await this.userRolesService.update(id, updateDto);
  //     return {
  //       success: true,
  //       message: 'User role updated successfully',
  //       data: role,
  //     };
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       message:
  //         error.code === '23505'
  //           ? `Role "${updateDto.name}" already exists`
  //           : error.message || 'Failed to update role',
  //       data: null,
  //     };
  //   }
  // }

  /** DELETE */
  // @Delete(':id')
  // async remove(
  //   @Param('id', ParseIntPipe) id: number,
  // ): Promise<ApiResponse<null>> {
  //   try {
  //     await this.userRolesService.remove(id);
  //     return {
  //       success: true,
  //       message: 'User role deleted successfully',
  //       data: null,
  //     };
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       message: error.message || 'Failed to delete user role',
  //       data: null,
  //     };
  //   }
  // }

  /** STATS */
  @Get('stats/all')
  async getStats(): Promise<ApiResponse<any>> {
    try {
      const stats = await this.userRolesService.getStats();
      return {
        success: true,
        message: 'User role stats fetched successfully',
        data: stats,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to fetch stats',
        data: null,
      };
    }
  }
}
