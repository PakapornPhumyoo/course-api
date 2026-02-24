import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  instructor: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  lessons: string[];
}

export const CourseSchema =
  SchemaFactory.createForClass(Course);

export type CourseDocument = Course & Document;