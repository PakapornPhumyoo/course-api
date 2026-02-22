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

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateCourseDto, @Req() req: any) {
    return this.coursesService.create(dto, req.user.userId);
  }

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }
}