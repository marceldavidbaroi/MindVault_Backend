import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TagGroupsService } from '../services/tag-groups.service';
import {
  CreateTagGroupDto,
  UpdateTagGroupDto,
  QueryTagGroupDto,
} from '../dto/shared.dto';
import { User } from 'src/auth/entity/user.entity';
import { GetUser } from 'src/auth/get-user.decorator';
import { ApiResponse as ResponseType } from 'src/common/types/api-response.type';

@ApiTags('Tag Groups')
@UseGuards(AuthGuard('jwt'))
@Controller('tags/groups')
export class TagGroupsController {
  constructor(private readonly service: TagGroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tag group' })
  @ApiBody({ type: CreateTagGroupDto })
  @ApiResponse({ status: 201, description: 'Tag group created successfully.' })
  async createGroup(
    @GetUser() user: User,
    @Body() dto: CreateTagGroupDto,
  ): Promise<ResponseType<any>> {
    return this.service.createGroup(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get list of tag groups' })
  async getAllGroups(
    @GetUser() user: User,
    @Query() query: QueryTagGroupDto,
  ): Promise<ResponseType<any>> {
    return this.service.getAllGroups(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tag group by ID' })
  @ApiParam({ name: 'id', type: Number })
  async getOneGroup(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseType<any>> {
    return this.service.getOneGroup(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tag group' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateTagGroupDto })
  async updateGroup(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTagGroupDto,
  ): Promise<ResponseType<any>> {
    return this.service.updateGroup(id, user, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a tag group' })
  @ApiParam({ name: 'id', type: Number })
  async deleteGroup(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseType<any>> {
    return this.service.deleteGroup(id, user);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted tag group' })
  @ApiParam({ name: 'id', type: Number })
  async restoreGroup(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseType<any>> {
    return this.service.restoreGroup(id, user);
  }

  @Delete(':id/force')
  @ApiOperation({ summary: 'Force delete a tag group permanently' })
  @ApiParam({ name: 'id', type: Number })
  async forceDeleteGroup(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseType<any>> {
    return this.service.forceDeleteGroup(id, user);
  }
}
