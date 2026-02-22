import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Enrollment,
  EnrollmentDocument,
} from './schemas/enrollment.schema';
import { CertificatesService } from '../certificates/certificates.service';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,

    // 🔥 เพิ่มตัวนี้
    private certificatesService: CertificatesService,
  ) { }

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
    });

    return enrollment.save();
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

    // reset progress ถ้าไม่ผ่าน
    if (status === 'pending' || status === 'rejected') {
      enrollment.progress = 0;
    }

    // ถ้า admin กด completed เอง
    if (status === 'completed') {
      enrollment.progress = 100;

      // 🔥 สร้าง certificate อัตโนมัติ
      await this.certificatesService.createCertificate(
        enrollment.user.toString(),
        enrollment.course.toString(),
      );
    }

    return enrollment.save();
  }

  // ==============================
  // UPDATE PROGRESS
  // ==============================
  async updateProgress(id: string, progress: number) {
    const enrollment = await this.enrollmentModel.findById(id);

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (
      enrollment.status !== 'approved' &&
      enrollment.status !== 'completed'
    ) {
      throw new BadRequestException(
        'Cannot update progress. Enrollment not approved.',
      );
    }

    if (progress < 0 || progress > 100) {
      throw new BadRequestException(
        'Progress must be between 0 and 100',
      );
    }

    enrollment.progress = progress;

    if (progress === 100 && enrollment.status !== 'completed') {
      enrollment.status = 'completed';

      await this.certificatesService.createCertificate(
        enrollment.user.toString(),
        enrollment.course.toString(),
      );
    }

    return enrollment.save();
  }
}