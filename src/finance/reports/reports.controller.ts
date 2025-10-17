import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  Patch,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/auth/user.entity';
import { GetUser } from 'src/auth/get-user.decorator';
import { FilterReportsDto } from './dto/filter-reports.dto';
import { CreateReportDto } from './dto/create-report.dto';

import type { Response } from 'express';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
  // constructor(private readonly reportsService: ReportsService) {}
  // /** List all reports */
  // @Get()
  // async findAll(
  //   @GetUser() user: User,
  //   @Query() filterReportsDto: FilterReportsDto,
  // ) {
  //   const reports = await this.reportsService.findAll(user, filterReportsDto);
  //   return {
  //     success: true,
  //     message: 'Reports fetched successfully',
  //     data: reports,
  //   };
  // }
  // /** Generate a new report (monthly, halfYearly, yearly) */
  // @Post()
  // async create(
  //   @GetUser() user: User,
  //   @Body() createReportDto: CreateReportDto,
  // ) {
  //   const report = await this.reportsService.create(
  //     createReportDto.reportType,
  //     user,
  //     createReportDto.month,
  //     createReportDto.year,
  //   );
  //   return {
  //     success: true,
  //     message: 'Report created successfully',
  //     data: report,
  //   };
  // }
  // /** Top 3 categories by spending */
  // @Get('top-categories')
  // async topCategories(
  //   @GetUser() user: User,
  //   @Query('month') month?: number,
  //   @Query('year') year?: number,
  // ) {
  //   const topCategories = await this.reportsService.topCategories(
  //     user,
  //     month,
  //     year,
  //   );
  //   return {
  //     success: true,
  //     message: 'Top categories fetched successfully',
  //     data: topCategories,
  //   };
  // }
  // /** Category charts (pie/bar data) */
  // @Get('category-charts')
  // async categoryCharts(
  //   @GetUser() user: User,
  //   @Query('month') month?: number,
  //   @Query('year') year?: number,
  // ) {
  //   const categoryCharts = await this.reportsService.categoryCharts(
  //     user,
  //     month,
  //     year,
  //   );
  //   return {
  //     success: true,
  //     message: 'Category charts fetched successfully',
  //     data: categoryCharts,
  //   };
  // }
  // /** Get a single report */
  // @Get(':id')
  // async findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
  //   const report = await this.reportsService.findOne(id, user);
  //   return {
  //     success: true,
  //     message: 'Report fetched successfully',
  //     data: report,
  //   };
  // }
  // /** Update a report */
  // @Patch(':id')
  // async update(@Param('id') id: number, @GetUser() user: User) {
  //   const report = await this.reportsService.update(id, user);
  //   return {
  //     success: true,
  //     message: 'Report updated successfully',
  //     data: report,
  //   };
  // }
  // /** Delete a cached report */
  // @Delete(':id')
  // async remove(@Param('id') id: number, @GetUser() user: User) {
  //   await this.reportsService.remove(id, user);
  //   return {
  //     success: true,
  //     message: 'Report deleted successfully',
  //     data: null,
  //   };
  // }
}
