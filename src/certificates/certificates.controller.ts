import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('certificates')
export class CertificatesController {
  constructor(private certificatesService: CertificatesService) {}

  /**
   * User ดู certificate ของตัวเอง
   * ต้อง login
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-certificates')
  async getMyCertificates(@Req() req: any) {
    const certificates =
      await this.certificatesService.findMyCertificates(
        req.user.userId,
      );

    return {
      message: 'Certificates fetched successfully',
      data: certificates,
    };
  }

  /**
   * Admin ดู certificate ทั้งหมด
   */
  @Get()
  async getAllCertificates() {
    const certificates =
      await this.certificatesService.findAllCertificates();

    return {
      message: 'All certificates fetched successfully',
      data: certificates,
    };
  }
}