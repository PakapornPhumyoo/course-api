import { IsIn } from 'class-validator';

export class UpdateStatusDto {
  @IsIn(['pending', 'approved', 'rejected', 'completed'])
  status: string;
}