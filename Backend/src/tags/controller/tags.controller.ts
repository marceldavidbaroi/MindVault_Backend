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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TagsService } from '../services/tags.service';
import { CreateTagDto, UpdateTagDto, QueryTagDto } from '../dto/shared.dto';
import { User } from 'src/auth/entities/user.entity';
import { GetUser } from 'src/auth/get-user.decorator';
import { ApiResponse as ResponseType } from 'src/common/types/api-response.type';

@ApiTags('Tags')
@UseGuards(AuthGuard('jwt'))
@Controller('tags')
export class TagsController {
  constructor(private readonly service: TagsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiBody({ type: CreateTagDto })
  @ApiResponse({ status: 201, description: 'Tag created successfully.' })
  async create(
    @GetUser() user: User,
    @Body() dto: CreateTagDto,
  ): Promise<ResponseType<any>> {
    return this.service.create(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get list of tags' })
  @ApiResponse({
    status: 200,
    description: 'List of tags fetched successfully.',
  })
  async getAll(
    @GetUser() user: User,
    @Query() query: QueryTagDto,
  ): Promise<ResponseType<any>> {
    return this.service.getAll(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tag by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Tag fetched successfully.' })
  async getOne(
    @GetUser() user: User,
    @Param('id') id: number,
  ): Promise<ResponseType<any>> {
    return this.service.getOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tag' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateTagDto })
  @ApiResponse({ status: 200, description: 'Tag updated successfully.' })
  async update(
    @GetUser() user: User,
    @Param('id') id: number,
    @Body() dto: UpdateTagDto,
  ): Promise<ResponseType<any>> {
    return this.service.update(id, user, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a tag' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Tag soft-deleted successfully.' })
  async delete(
    @GetUser() user: User,
    @Param('id') id: number,
  ): Promise<ResponseType<any>> {
    return this.service.delete(id, user);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted tag' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Tag restored successfully.' })
  async restore(
    @GetUser() user: User,
    @Param('id') id: number,
  ): Promise<ResponseType<any>> {
    return this.service.restore(id, user);
  }

  @Delete(':id/force')
  @ApiOperation({ summary: 'Force delete a tag permanently' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Tag permanently deleted.' })
  async forceDelete(
    @GetUser() user: User,
    @Param('id') id: number,
  ): Promise<ResponseType<any>> {
    return this.service.forceDelete(id, user);
  }
}
