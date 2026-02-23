import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EnrollmentDocument = Enrollment & Document;

@Schema({ timestamps: true })
export class Enrollment {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Course',
    required: true,
  })
  course: Types.ObjectId;

  @Prop({ default: 'pending' })
  status: string;

  @Prop({ default: 0 })
  progress: number;

  // ✅ เพิ่มอันนี้
  @Prop({ type: [String], default: [] })
  completedLessons: string[];
}

export const EnrollmentSchema =
  SchemaFactory.createForClass(Enrollment);