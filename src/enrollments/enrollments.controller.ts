import {
  Body,
  Controller,
  Post,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Patch, Param } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(
    private readonly enrollmentsService: EnrollmentsService,
  ) { }

  // สมัครเรียน (ต้อง login)
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() dto: CreateEnrollmentDto,
    @Req() req: any,
  ) {
    return this.enrollmentsService.create(
      req.user.userId, // ✅ แก้จาก sub → userId
      dto.courseId,
    );
  }

  // ดู enrollment ของตัวเอง
  @Get('my')
  @UseGuards(JwtAuthGuard)
  async findMy(@Req() req: any) {
    return this.enrollmentsService.findMyEnrollments(
      req.user.userId, // ✅ แก้จาก sub → userId
    );
  }

  // ==============================
  // ADMIN: ดูทั้งหมด
  // ==============================
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll() {
    return this.enrollmentsService.findAll();
  }

  // ==============================
  // ADMIN: เปลี่ยนสถานะ
  // ==============================
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.enrollmentsService.updateStatus(
      id,
      dto.status,
    );
  }

  // ==============================
  // ADMIN: อัปเดต progress
  // ==============================
  @Patch(':id/progress')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateProgress(
    @Param('id') id: string,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.enrollmentsService.updateProgress(
      id,
      dto.progress,
    );
  }
}