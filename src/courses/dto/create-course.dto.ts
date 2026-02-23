import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsMongoId,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  price: number;

  @IsMongoId()
  @IsNotEmpty()
  instructor: string;

  @IsArray()
  lessons: string[];
}