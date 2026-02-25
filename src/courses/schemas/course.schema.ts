import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

@Schema({ _id: false })
export class Lesson {
  @Prop({ required: true })
  slug: string; // เช่น lesson-1

  @Prop({ required: true })
  title: string; // ชื่อบท

  @Prop({ default: '' })
  content: string; // เนื้อหา (text/markdown)
}
export const LessonSchema = SchemaFactory.createForClass(Lesson);

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  instructor: Types.ObjectId;

  // ✅ เปลี่ยนจาก string[] -> Lesson[]
  @Prop({ type: [LessonSchema], default: [] })
  lessons: Lesson[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);
export type CourseDocument = Course & Document;