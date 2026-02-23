import {
  Body,
  Controller,
  Post,
  UseGuards,
  Req,
  Get,
  Patch,
  Param,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(
    private readonly enrollmentsService: EnrollmentsService,
  ) { }

  /**
   * สมัครเรียน (User ต้อง Login)
   */

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() dto: CreateEnrollmentDto,
    @Req() req: any,
  ) {
    const enrollment = await this.enrollmentsService.create(
      req.user.userId,
      dto.courseId,
    );

    return {
      message: 'Enrollment created successfully',
      data: enrollment,
    };
  }

  /**
   * ดูรายการสมัครของตัวเอง
   */
  @Get('my')
  @UseGuards(JwtAuthGuard)
  async findMy(@Req() req: any) {
    const enrollments =
      await this.enrollmentsService.findMyEnrollments(
        req.user.userId,
      );

    return {
      message: 'My enrollments fetched successfully',
      data: enrollments,
    };
  }

  /**
   * Admin ดูทั้งหมด
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll() {
    const enrollments =
      await this.enrollmentsService.findAll();

    return {
      message: 'All enrollments fetched successfully',
      data: enrollments,
    };
  }

  /**
   * Admin เปลี่ยนสถานะ enrollment
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    const result =
      await this.enrollmentsService.updateStatus(
        id,
        dto.status,
      );

    return {
      message: 'Enrollment status updated successfully',
      data: result,
    };
  }

  /**
   * User ทำเครื่องหมายว่าเรียนบทเรียนนี้แล้ว
   * จะอัพเดต progress และ status ของ enrollment
   * ถ้าเรียนครบ → status = completed
   * ถ้าไม่ครบ → status = in-progress
   * ใช้ JwtAuthGuard ป้องกัน
   * ตรวจสอบว่า user นี้เป็นเจ้าของ enrollment นี้เท่านั้น
   * ถ้าไม่ใช่เจ้าของ → throw UnauthorizedException
   * ถ้า enrollment ไม่พบ → throw NotFoundException
   */

  @Patch(':enrollmentId/lessons/:lessonId/complete')
  @UseGuards(JwtAuthGuard)
  updateProgress(
    @Param('enrollmentId') enrollmentId: string,
    @Param('lessonId') lessonId: string,
    @Req() req,
  ) {
    return this.enrollmentsService.updateProgress(
      enrollmentId,
      lessonId,
      req.user.userId,
    );
  }
}