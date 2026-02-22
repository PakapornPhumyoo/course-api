import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // ==========================
  // CREATE USER
  // ==========================
  async create(name: string, email: string, password: string) {
    const existingUser = await this.userModel.findOne({ email });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const user = new this.userModel({
      name,
      email,
      password, // ✅ เปลี่ยนจาก passwordHash เป็น password
    });

    return user.save();
  }

  // ==========================
  // FIND BY EMAIL
  // ==========================
  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  // ==========================
  // FIND BY ID
  // ==========================
  async findById(id: string) {
    return this.userModel.findById(id);
  }
}