import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,               // ตัด field ที่ไม่อยู่ใน DTO ทิ้ง
      forbidNonWhitelisted: true,    // ถ้ามี field แปลก → error 400
      transform: true,               // แปลง type อัตโนมัติ (สำคัญมาก)
    }),
  );

  // ✅ Global Response Format
  app.useGlobalInterceptors(
    new ResponseInterceptor(),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') || 3000;

  await app.listen(port);
}
bootstrap();