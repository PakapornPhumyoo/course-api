import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    UsersModule,
    ConfigModule,

    // ✅ ใช้สำหรับ Access Token
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'default_secret',
        signOptions: {
          expiresIn:
            (config.get<string>('JWT_EXPIRES') as any) || '15m',
        },
      }),
    }),
  ],

  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,
  ],

  controllers: [AuthController],

  exports: [
    JwtModule,
  ],
})
export class AuthModule { }