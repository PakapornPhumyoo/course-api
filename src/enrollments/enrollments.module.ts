import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Enrollment,
  EnrollmentSchema,
} from './schemas/enrollment.schema';

import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';

// 🔥 เพิ่ม import นี้
import { Course, CourseSchema } from '../courses/schemas/course.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Enrollment.name, schema: EnrollmentSchema },

      // 🔥 เพิ่มตัวนี้เข้าไป
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule { }