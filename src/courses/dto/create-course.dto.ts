import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;
}