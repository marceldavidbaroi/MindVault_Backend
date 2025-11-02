import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
} from '@nestjs/swagger';
import { ApiResponse } from 'src/common/types/api-response.type';
import { Category } from './categories.entity';
import { FilterCategoryDto } from './dto/filter-category.dto';

@ApiTags('Categories')
@UseGuards(AuthGuard('jwt'))
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @SwaggerResponse({
    status: 201,
    description: 'Category created successfully.',
  })
  async create(
    @GetUser() user: User,
    @Body() dto: CreateCategoryDto,
  ): Promise<ApiResponse<Category>> {
    const category = await this.categoriesService.createCategory(user, dto);
    return { success: true, message: 'Category created', data: category };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a category' })
  @SwaggerResponse({
    status: 200,
    description: 'Category updated successfully.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
    @Body() dto: UpdateCategoryDto,
  ): Promise<ApiResponse<Category>> {
    const category = await this.categoriesService.updateCategory(id, dto, user);
    return { success: true, message: 'Category updated', data: category };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  @SwaggerResponse({
    status: 200,
    description: 'Category deleted successfully.',
  })
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<ApiResponse<null>> {
    await this.categoriesService.deleteCategory(id, user);
    return { success: true, message: 'Category deleted', data: null };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single category' })
  @SwaggerResponse({
    status: 200,
    description: 'Category fetched successfully.',
  })
  async get(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<ApiResponse<Category>> {
    const category = await this.categoriesService.getCategory(id, user);
    return { success: true, message: 'Category fetched', data: category };
  }

  @Get()
  @ApiOperation({ summary: 'List categories' })
  @SwaggerResponse({
    status: 200,
    description: 'Categories fetched successfully.',
  })
  async list(
    @GetUser() user: User,
    @Query() filters: FilterCategoryDto,
  ): Promise<ApiResponse<Category[]>> {
    const { type, search, scope } = filters;
    const categories = await this.categoriesService.listCategories(
      user,
      type,
      search,
      scope,
    );
    return { success: true, message: 'Categories fetched', data: categories };
  }
}
