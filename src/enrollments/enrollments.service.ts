import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Enrollment, EnrollmentDocument } from './schemas/enrollment.schema';


@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
  ) { }

  // ==============================
  // CREATE ENROLLMENT
  // ==============================
  async create(userId: string, courseId: string) {
    // 🔥 1. เช็คว่าลงทะเบียนซ้ำไหม
    const existingEnrollment = await this.enrollmentModel.findOne({
      user: userId,
      course: courseId,
    });

    if (existingEnrollment) {
      throw new BadRequestException(
        'You already enrolled in this course',
      );
    }

    // 🔥 2. สร้าง enrollment ใหม่
    const enrollment = new this.enrollmentModel({
      user: userId,
      course: courseId,
      status: 'pending',
      progress: 0,
    });

    return enrollment.save();
  }

  // ==============================
  // GET MY ENROLLMENTS (populate)
  // ==============================
  async findMyEnrollments(userId: string) {
    return this.enrollmentModel
      .find({ user: userId })
      .populate('course') // 🔥 ดึงข้อมูล course มาเลย
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
      throw new Error('Enrollment not found');
    }

    enrollment.status = status;

    // 🔥 ถ้ากลับไป pending หรือ rejected ให้ reset progress
    if (status === 'pending' || status === 'rejected') {
      enrollment.progress = 0;
    }

    // 🔥 ถ้า completed ต้อง progress = 100
    if (status === 'completed') {
      enrollment.progress = 100;
    }

    return enrollment.save();
  }

  // ==============================
  // UPDATE PROGRESS (Admin)
  // ==============================
  async updateProgress(id: string, progress: number) {
    const enrollment = await this.enrollmentModel.findById(id);

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // 🔒 ต้องอนุมัติก่อนถึงจะอัปเดต progress ได้
    if (enrollment.status !== 'approved' && enrollment.status !== 'completed') {
      throw new BadRequestException(
        'Cannot update progress. Enrollment not approved.',
      );
    }

    // 🔢 เช็คช่วง 0-100
    if (progress < 0 || progress > 100) {
      throw new Error('Progress must be between 0 and 100');
    }

    enrollment.progress = progress;

    // 🎓 Auto complete logic
    if (progress === 100) {
      enrollment.status = 'completed';
    }

    // 🔁 ถ้าเคย completed แล้วลด progress ลง
    if (progress < 100 && enrollment.status === 'completed') {
      enrollment.status = 'approved';
    }

    return enrollment.save();
  }
}