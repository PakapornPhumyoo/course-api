import { IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProgressDto {
  @Type(() => Number) // 🔥 ป้องกันกรณีส่ง string มา
  @IsInt({ message: 'Progress must be an integer' })
  @Min(0, { message: 'Progress cannot be less than 0' })
  @Max(100, { message: 'Progress cannot be more than 100' })
  progress: number;
}