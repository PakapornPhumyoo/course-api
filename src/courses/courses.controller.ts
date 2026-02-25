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
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Query } from '@nestjs/common';

@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() dto: CreateCourseDto, @Req() req: any) {
    const course = await this.coursesService.create(dto, req.user.userId);
    return { message: 'Course created successfully', data: course };
  }

  @Get()
  async findAll(@Query('q') q?: string) {
    const courses = await this.coursesService.findAll(q);

    return {
      message: 'Courses fetched successfully',
      data: courses,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const course = await this.coursesService.findOne(id);
    return { message: 'Course fetched successfully', data: course };
  }

  // ✅ ดึง lesson
  @Get(':courseId/lessons/:lessonSlug')
  async getLesson(
    @Param('courseId') courseId: string,
    @Param('lessonSlug') lessonSlug: string,
  ) {
    const result = await this.coursesService.getLesson(courseId, lessonSlug);
    return { message: 'Lesson fetched successfully', data: result };
  }

  // ✅ แก้ lesson (admin only)
  @Patch(':courseId/lessons/:lessonSlug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateLesson(
    @Param('courseId') courseId: string,
    @Param('lessonSlug') lessonSlug: string,
    @Body() dto: UpdateLessonDto,
  ) {
    return this.coursesService.updateLesson(courseId, lessonSlug, dto);
  }

  // ==========================
  // ✅ PATCH COURSE (admin only)
  // ==========================
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateCourse(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.updateCourse(id, dto);
  }

  // ==========================
  // ✅ DELETE COURSE (admin only)
  // ==========================
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string) {
    return this.coursesService.removeCourse(id);
  }
  // ✅ DELETE lesson (admin)
  @Delete(':courseId/lessons/:lessonSlug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteLesson(
    @Param('courseId') courseId: string,
    @Param('lessonSlug') lessonSlug: string,
  ) {
    return this.coursesService.deleteLesson(courseId, lessonSlug);
  }
}
