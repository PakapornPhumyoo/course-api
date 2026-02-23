import {
  Controller,
  Put,
  Delete,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard) // ✅ ใส่ครั้งเดียวพอ (ไม่ต้องใส่ทุก method)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * PUT /users/me
   * แก้ไขข้อมูลของตัวเอง
   */
  @Put('me')
  async updateMe(
    @Req() req,
    @Body() body: UpdateUserDto,
  ) {
    return this.usersService.update(req.user.userId, body);
  }

  /**
   * DELETE /users/me
   * ลบบัญชีตัวเอง (Soft Delete)
   */
  @Delete('me')
  async deleteMe(@Req() req) {
    return this.usersService.deleteMe(req.user.userId);
  }
}