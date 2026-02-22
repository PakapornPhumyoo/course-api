import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
    Certificate,
    CertificateDocument,
} from './schemas/certificate.schema';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CertificatesService {
    constructor(
        @InjectModel(Certificate.name)
        private certificateModel: Model<CertificateDocument>,
    ) { }

    // =====================================================
    // 🎓 CREATE CERTIFICATE (กันสร้างซ้ำ + เช็คบันทึก + สร้าง PDF)
    // =====================================================
    async createCertificate(userId: string, courseId: string) {
        console.log('🔥 createCertificate called');
        console.log('userId:', userId);
        console.log('courseId:', courseId);

        // 1️⃣ เช็คว่ามีอยู่แล้วไหม
        const existing = await this.certificateModel.findOne({
            user: userId,
            course: courseId,
        });

        if (existing) {
            console.log('⚠️ Certificate already exists');
            return existing;
        }

        const certNumber = 'CERT-' + Date.now();

        // 2️⃣ บันทึกลง MongoDB
        const certificate = await this.certificateModel.create({
            user: userId, // 👈 เป็น string
            course: courseId,
            issuedAt: new Date(),
            certificateNumber: certNumber,
        });

        console.log('✅ Saved certificate:', certificate);

        // =====================================================
        // 3️⃣ Generate PDF
        // =====================================================

        const certificatesDir = path.join(process.cwd(), 'certificates');

        if (!fs.existsSync(certificatesDir)) {
            fs.mkdirSync(certificatesDir);
        }

        const filePath = path.join(certificatesDir, `${certNumber}.pdf`);

        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(filePath));

        doc.fontSize(28).text('Certificate of Completion', {
            align: 'center',
        });

        doc.moveDown();
        doc.fontSize(18).text(`Certificate Number: ${certNumber}`, {
            align: 'center',
        });

        doc.moveDown();
        doc.fontSize(14).text(
            `Issued at: ${new Date().toDateString()}`,
            { align: 'center' },
        );

        doc.end();

        console.log('📄 PDF Generated at:', filePath);

        return certificate;
    }

    // =====================================================
    // 👤 USER: ดู certificate ของตัวเอง
    // =====================================================
    async findMyCertificates(userId: string) {
        console.log('🔍 findMyCertificates userId from JWT:', userId);

        const all = await this.certificateModel.find();
        console.log('📦 All certificates in DB:', all);

        const result = await this.certificateModel.find({
            user: userId,
        });

        console.log('📦 Certificates found for this user:', result);

        return result;
    }

    // =====================================================
    // 🛠 ADMIN: ดูทั้งหมด
    // =====================================================
    async findAllCertificates() {
        const result = await this.certificateModel.find().exec();

        console.log('📦 All certificates:', result.length);

        return result;
    }
}