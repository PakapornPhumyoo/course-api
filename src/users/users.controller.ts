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

import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  /**
   * PUT /users/me
   * แก้ไขข้อมูลของตัวเอง
   */
  @Put('me')
  @ApiOperation({ summary: 'อัปเดตข้อมูลส่วนตัวของฉัน (ต้อง login)' })
  @ApiBody({ type: UpdateUserDto })
  async updateMe(@Req() req: any, @Body() body: UpdateUserDto) {
    return this.usersService.update(req.user.userId, body);
  }
  /**
   * DELETE /users/me
   * ลบบัญชีตัวเอง (Soft Delete)
   */
  @Delete('me')
  @ApiOperation({ summary: 'ลบบัญชีของฉัน (soft delete) (ต้อง login)' })
  async deleteMe(@Req() req: any) {
    return this.usersService.deleteMe(req.user.userId);
  }
}