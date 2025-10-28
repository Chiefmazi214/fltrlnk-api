import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { VerificationCodeRepositoryInterface } from './repositories/abstract/verification-code.repository-interface';
import {
  VerificationCodeDocument,
  VerificationCodeTypes,
} from './models/verification-code.model';
import { UserService } from 'src/user/user.service';
import mongoose from 'mongoose';

@Injectable()
export class VerificationService {
  constructor(
    @Inject(VerificationCodeRepositoryInterface)
    private readonly verificationCodeRepository: VerificationCodeRepositoryInterface,
    private readonly userService: UserService,
  ) {}

  async createVerificationCode(
    type: VerificationCodeTypes,
    email?: string,
    phone?: string,
  ): Promise<VerificationCodeDocument> {
    const user = await this.userService.getUserByPhoneOrEmail(phone, email);
    const oldVerificationCode = await this.verificationCodeRepository.findOne({
      userId: user._id.toString(),
      type: type,
    });
    if (oldVerificationCode) {
      await this.verificationCodeRepository.delete(oldVerificationCode.id);
    }

    const code = this.generateVerifyCode().toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    const verificationCode = await this.verificationCodeRepository.create({
      code,
      type,
      expiresAt,
      userId: user._id.toString(),
    });
    // if(email && !phone){
    //     const mail = new Mail();
    //     mail.to = email;
    //     mail.subject = "Verification Code";
    //     mail.text = `Your verification code is ${code}`;
    //     await this.mailService.sendMail(mail);
    // }else if(phone && !email){
    //     await this.smsService.sendOtp(phone, code);
    // }else if(phone && email){
    //     const mail = new Mail();
    //     mail.to = email;
    //     mail.subject = "Verification Code";
    //     mail.text = `Your verification code is ${code}`;
    //     await this.mailService.sendMail(mail);
    // }else{
    //     throw new BadRequestException("Invalid input");
    // }
    return verificationCode;
  }

  async verifyCode(
    code: string,
    email?: string,
    phone?: string,
  ): Promise<VerificationCodeDocument> {
    const user = await this.userService.getUserByPhoneOrEmail(phone, email);
    const verificationCode = await this.verificationCodeRepository.findOne({
      code: code,
      userId: user._id.toString(),
    });
    console.log(new Date());
    console.log(verificationCode);
    if (!verificationCode) {
      throw new BadRequestException('Invalid or expired verification code');
    }
    if (verificationCode.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired verification code');
    }
    if (verificationCode.isVerified) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    const updatedVerificationCode =
      await this.verificationCodeRepository.update(verificationCode.id, {
        isVerified: true,
      });
    return updatedVerificationCode;
  }

  private generateVerifyCode() {
    return Math.floor(100000 + Math.random() * 900000);
  }
}
