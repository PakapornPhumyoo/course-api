import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('certificates')
export class CertificatesController {
    constructor(private certificatesService: CertificatesService) { }

    // 👤 ดู certificate ของตัวเอง
    @UseGuards(JwtAuthGuard)
    @Get('my-certificates')
    getMyCertificates(@Req() req) {
        console.log('🧾 req.user =', req.user);
        return this.certificatesService.findMyCertificates(req.user.userId);
    }

    // 🛠 Admin ดูทั้งหมด
    @Get()
    async getAllCertificates() {
        return this.certificatesService.findAllCertificates();
    }

    
}