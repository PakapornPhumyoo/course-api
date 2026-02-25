import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';

import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  // ==========================
  // ✅ CREATE COURSE (admin)
  // ==========================
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'สร้าง course (admin only)' })
  @ApiBody({ type: CreateCourseDto })
  async create(@Body() dto: CreateCourseDto, @Req() req: any) {
    const course = await this.coursesService.create(dto, req.user.userId);
    return { message: 'Course created successfully', data: course };
  }

  // ==========================
  // ✅ GET ALL COURSES (public)
  // ==========================
  @Get()
  @ApiOperation({ summary: 'แสดง course ทั้งหมด + search q' })
  @ApiQuery({ name: 'q', required: false, description: 'ค้นหาจาก title/description' })
  async findAll(@Query('q') q?: string) {
    const courses = await this.coursesService.findAll(q);
    return { message: 'Courses fetched successfully', data: courses };
  }

  // ==========================
  // ✅ GET COURSE BY ID (public)
  // ==========================
  @Get(':id')
  @ApiOperation({ summary: 'แสดง course ตาม id (public)' })
  async findOne(@Param('id') id: string) {
    const course = await this.coursesService.findOne(id);
    return { message: 'Course fetched successfully', data: course };
  }

  // ==========================
  // ✅ GET LESSON (public)
  // ==========================
  @Get(':courseId/lessons/:lessonSlug')
  @ApiOperation({ summary: 'แสดง lesson content ตาม slug (public)' })
  async getLesson(
    @Param('courseId') courseId: string,
    @Param('lessonSlug') lessonSlug: string,
  ) {
    const result = await this.coursesService.getLesson(courseId, lessonSlug);
    return { message: 'Lesson fetched successfully', data: result };
  }

  // ==========================
  // ✅ UPDATE LESSON (admin)
  // ==========================
  @Patch(':courseId/lessons/:lessonSlug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'สร้างและอัปเดต lesson (admin only)' })
  @ApiBody({ type: UpdateLessonDto })
  async updateLesson(
    @Param('courseId') courseId: string,
    @Param('lessonSlug') lessonSlug: string,
    @Body() dto: UpdateLessonDto,
  ) {
    return this.coursesService.updateLesson(courseId, lessonSlug, dto);
  }

  // ==========================
  // ✅ UPDATE COURSE (admin)
  // ==========================
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'อัปเดต course (admin only)' })
  @ApiBody({ type: UpdateCourseDto })
  async updateCourse(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.updateCourse(id, dto);
  }

  // ==========================
  // ✅ DELETE COURSE (admin)
  // ==========================
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'ลบ course (admin only)' })
  async remove(@Param('id') id: string) {
    return this.coursesService.removeCourse(id);
  }

  // ==========================
  // ✅ DELETE LESSON (admin)
  // ==========================
  @Delete(':courseId/lessons/:lessonSlug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'ลบ lesson (admin only)' })
  async deleteLesson(
    @Param('courseId') courseId: string,
    @Param('lessonSlug') lessonSlug: string,
  ) {
    return this.coursesService.deleteLesson(courseId, lessonSlug);
  }
}