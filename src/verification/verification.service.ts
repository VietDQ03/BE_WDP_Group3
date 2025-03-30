import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateVerificationDto } from './dto/create-verification.dto';
import { UpdateVerificationDto } from './dto/update-verification.dto';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Verification, VerificationDocument } from './schemas/verification.schema';
import { Model, now, ObjectId } from 'mongoose';
import { genSaltSync, hashSync } from 'bcryptjs';
import { generateOtp } from './utils/otp.utils';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class VerificationService {

  private readonly minRequestIntervalMinutes = 1;
  private readonly tokenExpirationMinutes = 5;
  private readonly sizeOfToken = 6;

  constructor(
    @InjectModel(Verification.name)
    private verificationModel: Model<VerificationDocument>,
    private usersService: UsersService,
  ) { }

  async generateOtp(verificationDto: CreateVerificationDto) {
    const now = new Date();

    // Check if a token was requested too recently
    // Feel free to implement robust throthling/security
    const recentToken = await this.verificationModel.findOne({
      email: verificationDto.email,
      createdAt: {
        $gt: new Date(now.getTime() - this.minRequestIntervalMinutes * 60 * 1000),
      },
    });

    if (recentToken) {
      throw new BadRequestException(
        'thử lại sau 1 phút',
      );
    }

    const otp = generateOtp(this.sizeOfToken);
    const hashedToken = await this.getHashToken(otp)

    await this.verificationModel.create({
      email: verificationDto.email,
      token: hashedToken,
      createdAt: now,
      expiresAt: new Date(
        now.getTime() + this.tokenExpirationMinutes * 60 * 1000,
      ),
    });

    return otp;
  }

  getHashToken = (otp: string) => {

    const salt = genSaltSync(10);
    const hash = hashSync(otp, salt);
    return hash
  }

  async checkOtp(email: string, token: string) {
    const now = new Date();
    const validToken = await this.verificationModel
      .findOne({
        email,
        expiresAt: { $gt: now },
      })
      .sort({ createdAt: -1 });
    if (validToken && (await bcrypt.compare(token, validToken.token))) {
      // Activate the user
      return true;
    }
    return false;
  }

  async validateOtp(email: string, token: string) {
    const now = new Date();
    const validToken = await this.verificationModel
      .findOne({
        email,
        expiresAt: { $gt: now },
      })
      .sort({ createdAt: -1 });

    if (validToken && (await bcrypt.compare(token, validToken.token))) {
      await this.remove(validToken._id);
      return true;
    }
    return false;
  }

  async remove(id) {
    await this.verificationModel.findByIdAndDelete(id);
  }

}
