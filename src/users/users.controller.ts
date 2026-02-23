// นำเข้า (import) Controller decorator จาก NestJS
// Controller ใช้กำหนดว่า class นี้จะทำหน้าที่รับ HTTP request
import { Controller } from '@nestjs/common';

/**
 * @Controller('users')
 * 
 * กำหนด route หลักของ controller นี้เป็น /users
 * หมายความว่า ถ้ามีการเรียก API ที่ขึ้นต้นด้วย /users
 * จะถูกส่งเข้ามาที่ class นี้
 * 
 * ตัวอย่าง:
 * GET http://localhost:3000/users
 * POST http://localhost:3000/users
 */
@Controller('users')
export class UsersController {
  /**
   * ตอนนี้ class นี้ยังไม่มี method ใด ๆ
   * จึงยังไม่สามารถรับ GET, POST, PATCH, DELETE ได้
   * 
   * เปรียบเทียบง่าย ๆ:
   * - Controller = ประตู
   * - Method (@Get, @Post) = ช่องรับคำสั่ง
   * 
   * ตอนนี้มีแค่ "ประตู" แต่ยังไม่มีช่องรับคำสั่ง
   */
}