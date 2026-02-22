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

  // ==========================
  // SIGNUP
  // ==========================
  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  // ==========================
  // SIGNIN (ได้ Access + Refresh)
  // ==========================
  @Post('signin')
  async signin(@Body() dto: SigninDto) {
    return this.authService.signin(dto);
  }

  // ==========================
  // REFRESH TOKEN
  // ==========================
  @Post('refresh')
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  // ==========================
  // PROFILE (Protected)
  // ==========================
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    return req.user;
  }
}