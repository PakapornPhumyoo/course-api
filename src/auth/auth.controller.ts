import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshDto } from './dto/refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * ==========================
   * SIGNUP
   * ==========================
   * ใช้สำหรับสมัครสมาชิกใหม่
   * รับข้อมูลจาก SignupDto
   * เรียก service เพื่อสร้าง user และ hash password
   */
  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    const user = await this.authService.signup(dto);

    return {
      message: 'Signup successful',
      data: user,
    };
  }

  /**
   * ==========================
   * SIGNIN
   * ==========================
   * ใช้สำหรับเข้าสู่ระบบ
   * คืนค่า Access Token และ Refresh Token
   */
  @Post('signin')
  async signin(@Body() dto: SigninDto) {
    const tokens = await this.authService.signin(dto);

    return {
      message: 'Signin successful',
      data: tokens,
    };
  }

  /**
   * ==========================
   * REFRESH TOKEN
   * ==========================
   * ใช้สำหรับสร้าง Access Token ใหม่
   * โดยใช้ Refresh Token
   */
  @Post('refresh')
  async refresh(@Body() dto: RefreshDto) {
    const tokens = await this.authService.refresh(dto.refreshToken);

    return {
      message: 'Token refreshed successfully',
      data: tokens,
    };
  }

  /**
   * ==========================
   * PROFILE
   * ==========================
   * ใช้ JwtAuthGuard ป้องกัน
   * ดึงข้อมูล user จาก req.user (decoded JWT)
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    return {
      message: 'Profile fetched successfully',
      data: req.user,
    };
  }
}