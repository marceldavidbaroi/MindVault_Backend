import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FilterCategoriesDto } from './dto/filter-category.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { Category } from './categories.entity';
import { ApiResponse } from 'src/common/types/api-response.type';

@Controller('categories')
@UseGuards(AuthGuard('jwt'))
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /** CREATE */
  @Post()
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @GetUser() user: User,
  ): Promise<ApiResponse<Category>> {
    const category = await this.categoriesService.create(
      createCategoryDto,
      user,
    );
    return {
      success: true,
      message: 'Category created successfully',
      data: category,
    };
  }

  /** FIND ALL */
  @Get()
  async findAll(
    @Query() filterDto: FilterCategoriesDto,
    @GetUser() user: User,
  ): Promise<ApiResponse<Category[]>> {
    const categories = await this.categoriesService.findAll(
      filterDto,
      user?.id,
    );
    return {
      success: true,
      message: 'Categories fetched successfully',
      data: categories,
    };
  }

  /** FIND ONE */
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<Category>> {
    const category = await this.categoriesService.findOne(id);
    return {
      success: true,
      message: 'Category fetched successfully',
      data: category,
    };
  }

  /** UPDATE */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @GetUser() user: User,
  ): Promise<ApiResponse<Category>> {
    const category = await this.categoriesService.update(
      id,
      updateCategoryDto,
      user.id,
    );
    return {
      success: true,
      message: 'Category updated successfully',
      data: category,
    };
  }

  /** DELETE */
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<ApiResponse<null>> {
    await this.categoriesService.remove(id, user.id);
    return {
      success: true,
      message: 'Category deleted successfully',
      data: null,
    };
  }

  /** STATS */
  @Get('stats/all')
  async getStats(@GetUser() user: User) {
    const stats = await this.categoriesService.getStats(user?.id);
    return {
      success: true,
      message: 'Category stats fetched successfully',
      data: stats,
    };
  }
}
