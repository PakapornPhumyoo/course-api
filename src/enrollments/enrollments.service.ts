import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Enrollment,
  EnrollmentDocument,
} from './schemas/enrollment.schema';
import {
  Course,
  CourseDocument,
} from '../courses/schemas/course.schema';
import { CertificatesService } from '../certificates/certificates.service';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,

    @InjectModel(Course.name)
    private courseModel: Model<CourseDocument>,

    private certificatesService: CertificatesService,
  ) {}

  // ==============================
  // CREATE ENROLLMENT
  // ==============================
  async create(userId: string, courseId: string) {
    const existingEnrollment = await this.enrollmentModel.findOne({
      user: userId,
      course: courseId,
    });

    if (existingEnrollment) {
      throw new BadRequestException(
        'You already enrolled in this course',
      );
    }

    const enrollment = new this.enrollmentModel({
      user: userId,
      course: courseId,
      status: 'pending',
      progress: 0,
      completedLessons: [],
    });

    return enrollment.save();
  }

  // ==============================
  // COMPLETE LESSON (ใช้ enrollmentId)
  // ==============================
  async updateProgress(
    enrollmentId: string,
    lessonId: string,
    userId: string,
  ) {
    // 👇 populate แบบ generic เพื่อให้ TS รู้ว่าเป็น Course
    const enrollment = await this.enrollmentModel
      .findById(enrollmentId)
      .populate<{ course: Course }>('course');

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (enrollment.user.toString() !== userId) {
      throw new ForbiddenException(
        'You are not owner of this enrollment',
      );
    }

    if (
      enrollment.status !== 'approved' &&
      enrollment.status !== 'completed'
    ) {
      throw new BadRequestException(
        'Enrollment not approved',
      );
    }

    // กัน undefined
    if (!enrollment.completedLessons) {
      enrollment.completedLessons = [];
    }

    // กันกดซ้ำ
    if (enrollment.completedLessons.includes(lessonId)) {
      throw new BadRequestException(
        'Lesson already completed',
      );
    }

    const course = enrollment.course;

    if (!course || !course.lessons) {
      throw new BadRequestException(
        'Course lessons not found',
      );
    }

    if (!course.lessons.includes(lessonId)) {
      throw new BadRequestException(
        'Invalid lesson for this course',
      );
    }

    // เพิ่ม lesson
    enrollment.completedLessons.push(lessonId);

    // ===== คำนวณ progress =====
    const totalLessons = course.lessons.length;
    const completedCount = enrollment.completedLessons.length;

    enrollment.progress = Math.round(
      (completedCount / totalLessons) * 100,
    );

    // ===== ถ้าเรียนครบ =====
    if (
      enrollment.progress === 100 &&
      enrollment.status !== 'completed'
    ) {
      enrollment.status = 'completed';

      await this.certificatesService.createCertificate(
        enrollment.user.toString(),
        (course as any)._id.toString(),
      );
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

  // ==============================
  // UPDATE STATUS (Admin)
  // ==============================
  async updateStatus(id: string, status: string) {
    const enrollment = await this.enrollmentModel.findById(id);

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    enrollment.status = status;

    if (status === 'pending' || status === 'rejected') {
      enrollment.progress = 0;
      enrollment.completedLessons = [];
    }

    if (status === 'completed') {
      enrollment.progress = 100;

      await this.certificatesService.createCertificate(
        enrollment.user.toString(),
        enrollment.course.toString(),
      );
    }

    return enrollment.save();
  }
}