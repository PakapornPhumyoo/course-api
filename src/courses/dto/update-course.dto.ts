import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  /**
   * รับได้ทั้ง:
   * - string[] (เช่น ["lesson-1","lesson-2"])
   * - {slug,title,content}[] (แบบที่คุณใช้ในระบบ lesson)
   */
  @IsOptional()
  @IsArray()
  lessons?: any[];
}