import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { UserDocument } from 'src/user/models/user.model';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcryptjs';
import { VerificationService } from 'src/verification/verification.service';
import { VerificationCodeTypes } from 'src/verification/models/verification-code.model';
import * as fs from 'fs';
import * as path from 'path';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { VerifyDto } from './dtos/verify.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { GoogleProfile } from './dtos/google-profile.dto';
import { FacebookProfile } from './dtos/facebook-profile.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { RoleEnum } from 'src/user/models/role.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly verificationService: VerificationService,
  ) {}

  async updateLastActionDate(userId: string) {
    return this.userService.updateUser(userId, {
      lastActionDate: new Date(),
    });
  }

  async register(registerDto: RegisterDto) {
    const { email, phone, password } = registerDto;
    if (email && phone) {
      throw new BadRequestException('Email and phone cannot be used together');
    }

    const isExist = await this.userService.getUserByPhoneOrEmail(phone, email);
    if (isExist) throw new ForbiddenException('User already exist');

    const hashedPassword = await this.hashPassword(password);

    const user = await this.userService.createUser({
      ...registerDto,
      password: hashedPassword,
      emailVerified: false,
      phoneVerified: false,
    });

    const verificationCodeType = user.email
      ? VerificationCodeTypes.EMAIL
      : VerificationCodeTypes.PHONE;
    const verificationCode =
      await this.verificationService.createVerificationCode(
        verificationCodeType,
        user.email,
        user.phone,
      );
    console.log(verificationCode);
    //   await this.mailService.sendMail({
    //     html: this.getVerificationEmailTemplate(verificationCode.code.toString()),
    //     subject: "Verify Your Email - Hustily",
    //     to: email,
    //     text: `Your Hustily verification code is: ${verificationCode.code}`,
    //     from: "Hustily Support <support@mg.hustily.com>",
    //   });

    return this.jwtResponse(user);
  }

  async login(loginDto: LoginDto) {
    console.log('LoginDto', loginDto.email, loginDto.password);

    const user = await this.userService.getUserByPhoneOrEmail(
      loginDto.phone,
      loginDto.email,
    );
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.password)
      throw new UnauthorizedException('Please login with email or phone');
    const passwordTrue = await bcrypt.compare(loginDto.password, user.password);
    if (!passwordTrue) throw new UnauthorizedException('Invalid credentials');
    return this.jwtResponse(user);
  }

  async loginAdmin(loginDto: LoginDto) {
    console.log('LoginDto', loginDto.email, loginDto.password);
    const user = await this.userService.getUserByEmail(loginDto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.password)
      throw new UnauthorizedException('Please login with email or phone');
    const passwordTrue = await bcrypt.compare(loginDto.password, user.password);
    if (!passwordTrue) throw new UnauthorizedException('Invalid credentials');
    if (!user.roles.some((role) => role.name === RoleEnum.ADMIN))
      throw new UnauthorizedException('Invalid credentials');

    return this.jwtResponse(user);
  }

  async sendEmailVerificationOtp(email: string) {
    const user = await this.userService.getUserByEmail(email);
    if (!user) throw new UnauthorizedException();
    await this.verificationService.createVerificationCode(
      VerificationCodeTypes.EMAIL,
      email,
      user.phone,
    );

    return { message: 'verification code sent' };
  }

  async sendPhoneVerificationOtp(phone: string) {
    const user = await this.userService.getUserByPhone(phone);
    if (!user) throw new UnauthorizedException();
    await this.verificationService.createVerificationCode(
      VerificationCodeTypes.PHONE,
      user.email,
      phone,
    );

    return { message: 'Phone verification code sent' };
  }

  async verifyEmail(verifyDto: VerifyDto) {
    const user = await this.userService.getUserByEmail(verifyDto.email);
    if (!user) throw new UnauthorizedException();
    await this.verificationService.verifyCode(
      verifyDto.code.toString(),
      verifyDto.email,
      verifyDto.phone,
    );
    user.emailVerified = true;
    await this.userService.updateUser(user._id.toString(), user);

    return this.jwtResponse(user);
  }

  async verifyPhone(verifyDto: VerifyDto) {
    const user = await this.userService.getUserByPhone(verifyDto.phone);
    if (!user) throw new UnauthorizedException();
    const updatedCode = await this.verificationService.verifyCode(
      verifyDto.code.toString(),
      verifyDto.email,
      verifyDto.phone,
    );
    user.phoneVerified = true;
    await this.userService.updateUser(user._id.toString(), user);
    return this.jwtResponse(user);
  }

  async findOrCreateGoogleUser(profile: GoogleProfile) {
    const user = await this.userService.getUserByEmail(profile.emails[0].value);

    if (user) {
      if (user.googleProviderId) {
        return this.jwtResponse(user);
      } else {
        await this.userService.updateUser(user._id.toString(), {
          googleProviderId: profile.id,
        });
        return this.jwtResponse(user);
      }
    }

    const newUser = await this.userService.createUser({
      email: profile.emails[0].value,
      name: profile.displayName,
      googleProviderId: profile.id,
      emailVerified: true,
    });

    return this.jwtResponse(newUser);
  }

  async findOrCreateFacebookUser(profile: FacebookProfile) {
    const user = await this.userService.getUserByEmail(profile.emails[0].value);

    if (user) {
      if (user.facebookProviderId) {
        return this.jwtResponse(user);
      } else {
        await this.userService.updateUser(user._id.toString(), {
          facebookProviderId: profile.id,
        });
        return this.jwtResponse(user);
      }
    }

    const newUser = await this.userService.createUser({
      email: profile.emails[0].value,
      name: profile.displayName,
      facebookProviderId: profile.id,
      emailVerified: true,
    });

    return this.jwtResponse(newUser);
  }

  async sendForgetPasswordOtp(email: string, phone: string) {
    const user = await this.userService.getUserByPhoneOrEmail(phone, email);
    if (!user) throw new UnauthorizedException();
    await this.verificationService.createVerificationCode(
      VerificationCodeTypes.FORGOT_PASSWORD,
      email,
      phone,
    );
    const message = user.email
      ? `Verification code sent to ${user.email}`
      : `Verification code sent to ${user.phone}`;
    return {
      message,
    };
  }

  async updateEmail(userId: string, email: string) {
    const user = await this.userService.getUserById(userId);
    if (!user) throw new UnauthorizedException();
    const isExist = await this.userService.getUserByEmail(email);
    if (isExist) throw new BadRequestException('Email already exist');
    await this.userService.updateUser(userId, { email });
    await this.verificationService.createVerificationCode(
      VerificationCodeTypes.EMAIL,
      email,
      user.phone,
    );
    return {
      message: 'Email updated successfully',
    };
  }

  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    const user = await this.userService.getUserById(userId);
    console.log(user);
    if (!user) throw new UnauthorizedException();
    const passwordTrue = await bcrypt.compare(
      updatePasswordDto.oldPassword,
      user.password,
    );
    console.log(passwordTrue);
    if (!passwordTrue) throw new UnauthorizedException();
    const hashedPassword = await this.hashPassword(
      updatePasswordDto.newPassword,
    );
    await this.userService.updateUser(userId, { password: hashedPassword });
    return {
      message: 'Password updated successfully',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const verificationCode = await this.verificationService.verifyCode(
      resetPasswordDto.code.toString(),
      resetPasswordDto.email,
      resetPasswordDto.phone,
    );

    console.log(verificationCode, resetPasswordDto.password);

    const hashedPassword = await this.hashPassword(resetPasswordDto.password);
    await this.userService.updateUser(verificationCode.userId, {
      password: hashedPassword,
    });
    return {
      message: 'Password reset successfully',
    };
  }

  private async jwtResponse(
    user: UserDocument,
    expiresIn: string | number = '7d',
  ) {
    user.password = undefined;
    user.lifestyleInfo = undefined;

    const payload = { ...user.toJSON(), sub: user._id.toString() };
    delete payload.password;
    delete payload.lifestyleInfo;

    const signOptions: JwtSignOptions = { expiresIn } as JwtSignOptions;

    return {
      access_token: await this.jwtService.signAsync(payload, signOptions),
    };
  }

  saltRounds = 10;

  private async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(this.saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  private generateVerifyCode() {
    return Math.floor(100000 + Math.random() * 900000);
  }

  private getVerificationEmailTemplate(code: string) {
    const templatePath = path.join(
      process.cwd(),
      'src',
      'mail',
      'templates',
      'verification-email.template.html',
    );
    let template = fs.readFileSync(templatePath, 'utf8');
    return template.replace('{{code}}', code);
  }
}
