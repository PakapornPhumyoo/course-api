import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }

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

  // ==========================
  // UPDATE USER
  // ==========================
  async update(
    id: string,
    updateData: {
      name?: string;
      email?: string;
      password?: string;
    },
  ) {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // ถ้าแก้ email ต้องเช็คซ้ำ
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.userModel.findOne({
        email: updateData.email,
      });

      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    return this.userModel.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select('-password');
  }
}