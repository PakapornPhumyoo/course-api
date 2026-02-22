import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CertificateDocument = Certificate & Document;

@Schema({ timestamps: true })
export class Certificate {
    @Prop({ required: true })
    user: string;

    @Prop({ required: true })
    course: string;

    @Prop()
    issuedAt: Date;

    @Prop()
    certificateNumber: string;
}

export const CertificateSchema =
    SchemaFactory.createForClass(Certificate);