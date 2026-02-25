import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Enrollment, EnrollmentDocument } from './schemas/enrollment.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { hasLesson, normalizeLessons } from '../courses/utils/normalize-lessons';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,

    @InjectModel(Course.name)
    private courseModel: Model<CourseDocument>,
  ) {}

  // ==============================
  // CREATE ENROLLMENT (เรียนฟรี เข้าเรียนได้ทันที)
  // ==============================
  async create(userId: string, courseId: string) {
    const existingEnrollment = await this.enrollmentModel.findOne({
      user: userId,
      course: courseId,
    });

    if (existingEnrollment) {
      throw new BadRequestException('You already enrolled in this course');
    }

    const enrollment = new this.enrollmentModel({
      user: userId,
      course: courseId,
      status: 'in-progress',
      progress: 0,
      completedLessons: [],
    });

    return enrollment.save();
  }

  // ==============================
  // COMPLETE LESSON
  // ==============================
  async updateProgress(enrollmentId: string, lessonId: string, userId: string) {
    const enrollment = await this.enrollmentModel
      .findById(enrollmentId)
      .populate<{ course: Course }>('course');

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (enrollment.user.toString() !== userId) {
      throw new ForbiddenException('You are not owner of this enrollment');
    }

    if (!enrollment.completedLessons) {
      enrollment.completedLessons = [];
    }

    // ✅ กัน lessonId แปลก ๆ
    const safeLessonId = decodeURIComponent(String(lessonId)).trim();
    if (!safeLessonId) {
      throw new BadRequestException('Lesson id is required');
    }

    if (enrollment.completedLessons.includes(safeLessonId)) {
      throw new BadRequestException('Lesson already completed');
    }

    const course = enrollment.course;

    if (!course) {
      throw new BadRequestException('Course not found in enrollment');
    }

    if (!course.lessons) {
      throw new BadRequestException('Course lessons not found');
    }

    // ✅ เช็คได้ทั้ง lessons แบบ string[] และ object[]
    if (!hasLesson(course.lessons as any[], safeLessonId)) {
      throw new BadRequestException('Invalid lesson for this course');
    }

    // ✅ เพิ่ม lesson ที่ทำเสร็จ
    enrollment.completedLessons.push(safeLessonId);

    // ✅ ใช้ lessons ที่ normalize แล้ว คิด total ให้ถูก
    const normalized = normalizeLessons(course.lessons as any[]);
    const totalLessons = normalized.length;

    // ✅ กันหาร 0 และคุม progress
    if (totalLessons <= 0) {
      enrollment.progress = 0;
      enrollment.status = 'in-progress';
    } else {
      const completedCount = enrollment.completedLessons.length;

      enrollment.progress = Math.min(
        100,
        Math.max(0, Math.round((completedCount / totalLessons) * 100)),
      );

      enrollment.status =
        enrollment.progress === 100 ? 'completed' : 'in-progress';
    }

    await enrollment.save();

    return {
      message: 'Lesson marked as completed',
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons,
      status: enrollment.status,
    };
  }

  // ==============================
  // GET MY ENROLLMENTS
  // ==============================
  async findMyEnrollments(userId: string) {
    return this.enrollmentModel
      .find({ user: userId })
      .populate('course')
      .exec();
  }

  // ==============================
  // GET ALL ENROLLMENTS (Admin)
  // ==============================
  async findAll() {
    return this.enrollmentModel
      .find()
      .populate('user')
      .populate('course')
      .exec();
  }
}