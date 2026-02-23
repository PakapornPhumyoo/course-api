import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // =====================================================
  // SIGNUP
  // =====================================================
  async signup(dto: SignupDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);

    // 🔥 ป้องกันสมัครซ้ำ
    if (existingUser && !existingUser.isDeleted) {
      throw new BadRequestException('Email already exists');
    }

    const hash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create(
      dto.name,
      dto.email,
      hash,
    );

    return {
      message: 'User created successfully',
      userId: user._id,
    };
  }

  // =====================================================
  // SIGNIN
  // =====================================================
  async signin(dto: SigninDto) {
    const user = await this.usersService.findByEmail(dto.email);

    // ❌ ไม่พบ user
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // ❌ user ถูกลบแล้ว
    if (user.isDeleted) {
      throw new UnauthorizedException('Account has been deleted');
    }

    const passwordMatch = await bcrypt.compare(
      dto.password,
      user.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const tokens = await this.generateTokens(payload);

    return {
      ...tokens,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  // =====================================================
  // REFRESH TOKEN
  // =====================================================
  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // 🔥 เช็คว่า user ยังมีอยู่ และยังไม่ถูกลบ
      const user = await this.usersService.findById(payload.sub);

      if (!user || user.isDeleted) {
        throw new UnauthorizedException('Account no longer exists');
      }

      const newAccessToken = await this.jwtService.signAsync(
        {
          sub: user._id,
          email: user.email,
          role: user.role,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn:
            (this.configService.get<string>('JWT_EXPIRES') as any) || '15m',
        },
      );

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // =====================================================
  // PRIVATE: Generate Both Tokens
  // =====================================================
  private async generateTokens(payload: any) {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn:
        (this.configService.get<string>('JWT_EXPIRES') as any) || '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn:
        (this.configService.get<string>('JWT_REFRESH_EXPIRES') as any) || '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}