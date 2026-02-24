import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Course } from '../../courses/schemas/course.schema';

export type EnrollmentDocument = Enrollment & Document;

@Schema({ timestamps: true })
export class Enrollment {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: Types.ObjectId;

  // 👇 แก้ตรงนี้ให้รองรับ populate
  @Prop({
    type: Types.ObjectId,
    ref: 'Course',
    required: true,
  })
  course: Types.ObjectId | Course;

  @Prop({ default: 'in-progress' })
  status: string;

  // 👇 progress เริ่มต้น 0
  @Prop({ default: 0 })
  progress: number;

  // 👇 ต้องมี default: [] กัน undefined
  @Prop({ type: [String], default: [] })
  completedLessons: string[];
}

export const EnrollmentSchema =
  SchemaFactory.createForClass(Enrollment);