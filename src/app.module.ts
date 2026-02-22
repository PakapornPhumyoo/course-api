import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';


@Module({
  imports: [
    // โหลด .env ใช้ได้ทั้งโปรเจค
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // เชื่อม MongoDB แบบมาตรฐาน production
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI')!,
      }),
    }),

    // Modules
    UsersModule,
    AuthModule,
    CoursesModule,
    EnrollmentsModule,
  ],
})
export class AppModule {}