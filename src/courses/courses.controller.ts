import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  /**
   * ==========================
   * CREATE COURSE (Admin Only)
   * ==========================
   * ใช้ JwtAuthGuard + RolesGuard
   * ตรวจสอบ role ว่าเป็น admin เท่านั้น
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() dto: CreateCourseDto, @Req() req: any) {
    const course = await this.coursesService.create(
      dto,
      req.user.userId,
    );

    return {
      message: 'Course created successfully',
      data: course,
    };
  }

  /**
   * ==========================
   * GET ALL COURSES
   * ==========================
   * ใช้ดูคอร์สทั้งหมด
   * ไม่ต้อง login
   */
  @Get()
  async findAll() {
    const courses = await this.coursesService.findAll();

    return {
      message: 'Courses fetched successfully',
      data: courses,
    };
  }
}