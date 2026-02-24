import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private courseModel: Model<Course>,
  ) { }

  async create(dto: CreateCourseDto, instructorId: string) {
    const course = new this.courseModel({
      ...dto,
      instructor: instructorId,
    });

    return course.save();
  }

  async findAll() {
    return this.courseModel.find().populate('instructor');
  }

  async findOne(id: string) {
    const course = await this.courseModel.findById(id);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }
}