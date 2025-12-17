import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { GetUser } from 'src/auth/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
} from '@nestjs/swagger';
import { User } from 'src/auth/entity/user.entity';
import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { FilterCategoryDto } from '../dto/filter-category.dto';

@ApiTags('Finance Categories')
@UseGuards(AuthGuard('jwt'))
@Controller('finance/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @SwaggerResponse({
    status: 201,
    description: 'Category created successfully.',
  })
  async create(@GetUser() user: User, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(user, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  @SwaggerResponse({
    status: 200,
    description: 'Category updated successfully.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  @SwaggerResponse({
    status: 200,
    description: 'Category deleted successfully.',
  })
  async delete(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.categoriesService.deleteCategory(id, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single category' })
  @SwaggerResponse({
    status: 200,
    description: 'Category fetched successfully.',
  })
  async get(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.categoriesService.getCategory(id, user);
  }

  @Get()
  @ApiOperation({ summary: 'List categories' })
  @SwaggerResponse({
    status: 200,
    description: 'Categories fetched successfully.',
  })
  async list(@GetUser() user: User, @Query() filters: FilterCategoryDto) {
    const { type, search, scope } = filters;
    return this.categoriesService.listCategories(user, type, search, scope);
  }

  @Get('stats/all')
  @ApiOperation({ summary: 'Get categories statistics/status' })
  @SwaggerResponse({
    status: 200,
    description: 'Category statistics fetched successfully.',
  })
  async status(@GetUser() user: User) {
    return this.categoriesService.getCategoryStats();
  }
}
