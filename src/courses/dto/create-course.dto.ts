import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateCourseDto {
  @IsNotEmpty()
  title: string;

  description: string;

  @IsNumber()
  @Min(0)
  price: number;
}