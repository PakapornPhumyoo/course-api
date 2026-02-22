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
  ) { }

  // =====================================================
  // SIGNUP
  // =====================================================
  async signup(dto: SignupDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
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
  // SIGNIN (สร้าง Access + Refresh)
  // =====================================================
  async signin(dto: SigninDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
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
  // REFRESH TOKEN (STEP 6 สำคัญ)
  // =====================================================
  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      // 1️⃣ verify refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // 2️⃣ สร้าง access token ใหม่
      const newAccessToken = await this.jwtService.signAsync(
        {
          sub: payload.sub,
          email: payload.email,
          role: payload.role,
        },
        {
          secret:
            this.configService.get<string>('JWT_SECRET') ||
            'default_secret',

          expiresIn:
            (this.configService.get<string>('JWT_EXPIRES') as any) ||
            '15m',
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