import {
    Controller,
    Put,
    Body,
    Req,
    UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    /**
     * PUT /users/me
     * แก้ไขข้อมูลของตัวเอง
     * ใช้ JWT เพื่อดึง userId จาก token
     */
    @UseGuards(JwtAuthGuard)
    @Put('me')
    @UseGuards(JwtAuthGuard)
    async updateMe(
        @Req() req,
        @Body() body: UpdateUserDto,
    ) {
        return this.usersService.update(req.user.userId, body);
    }
}