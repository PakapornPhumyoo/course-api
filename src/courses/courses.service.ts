import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { findLesson, normalizeLessons } from './utils/normalize-lessons';

@Injectable()
export class CoursesService {
  [x: string]: any;
  constructor(
    @InjectModel(Course.name)
    private courseModel: Model<CourseDocument>,
  ) { }

  async create(dto: CreateCourseDto, instructorId: string) {
    const course = new this.courseModel({
      ...dto,
      instructor: instructorId,
    });
    return course.save();
  }

  async findAll(q?: string) {
    if (q) {
      return this.courseModel.find({
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
        ],
      }).populate('instructor');
    }
    return this.courseModel.find().populate('instructor');
  }

  async findOne(id: string) {
    const course = await this.courseModel.findById(id);
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  // ✅ GET lesson เนื้อหา
  async getLesson(courseId: string, lessonSlug: string) {
    const course = await this.courseModel.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');

    const lesson = findLesson(course.lessons as any[], lessonSlug);
    if (!lesson) throw new NotFoundException('Lesson not found');

    return {
      courseId: course._id,
      courseTitle: course.title,
      lesson,
    };
  }

  // ✅ PATCH lesson (admin)
  async updateLesson(courseId: string, lessonSlug: string, dto: UpdateLessonDto) {
    const course = await this.courseModel.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');

    const lessons = normalizeLessons(course.lessons as any[]);

    const idx = lessons.findIndex((l) => l.slug === lessonSlug);

    if (idx === -1) {
      const created = {
        slug: lessonSlug,
        title: dto.title ?? lessonSlug,
        content: dto.content ?? '',
      };

      lessons.push(created as any);
      course.lessons = lessons as any;
      await course.save();

      return {
        message: 'Lesson created successfully',
        data: created,
      };
    }

    lessons[idx] = {
      ...lessons[idx],
      title: dto.title ?? lessons[idx].title,
      content: dto.content ?? lessons[idx].content,
    } as any;

    course.lessons = lessons as any;
    await course.save();

    return {
      message: 'Lesson updated successfully',
      data: lessons[idx],
    };
  }

  // ==========================
  // ✅ PATCH /courses/:id (admin)
  // แก้คอร์สทั้งก้อน: title/description/lessons
  // ==========================
  async updateCourse(courseId: string, dto: UpdateCourseDto) {
    const course = await this.courseModel.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');

    if (dto.title !== undefined) course.title = dto.title;
    if (dto.description !== undefined) course.description = dto.description;

    if (dto.lessons !== undefined) {
      // normalize ให้เป็น {slug,title,content}[] เสมอ
      course.lessons = normalizeLessons(dto.lessons as any[]) as any;
    }

    const saved = await course.save();

    return {
      message: 'Course updated successfully',
      data: saved,
    };
  }

  // ==========================
  // ✅ DELETE /courses/:id (admin)
  // ==========================
  async removeCourse(courseId: string) {
    const course = await this.courseModel.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');

    await this.courseModel.deleteOne({ _id: courseId });

    return {
      message: 'Course deleted successfully',
    };
  }
  // ✅ DELETE lesson (admin)
  async deleteLesson(courseId: string, lessonSlug: string) {
    const course = await this.courseModel.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');

    const lessons = normalizeLessons(course.lessons as any[]);
    const exists = lessons.some((l) => l.slug === lessonSlug);

    if (!exists) throw new NotFoundException('Lesson not found');

    const next = lessons.filter((l) => l.slug !== lessonSlug);

    course.lessons = next as any;
    await course.save();

    return {
      message: 'Lesson deleted successfully',
      data: { slug: lessonSlug },
    };
  }
}