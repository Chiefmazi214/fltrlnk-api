import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { VerifyDto } from './dtos/verify.dto';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { SendEmailCodeDto } from './dtos/send-email-code.dto';
import { SendPhoneCodeDto } from './dtos/send-phone-code.dto';
import { ForgetPasswordDto } from './dtos/forget-password.dto';
import { AuthGuard } from './guards/auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GoogleAuthGuard } from './guards/google.guard';
import { Request, Response } from 'express';
import { FacebookAuthGuard } from './guards/facebook.guard';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { UpdateEmailDto } from './dtos/update-email.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('send/email/verification')
  @ApiOperation({ summary: 'Send email verification code' })
  @ApiResponse({
    status: 200,
    description: 'Verification code sent successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  sendEmailVerificationOtp(
    @Body() sendEmailVerificationOtpDto: SendEmailCodeDto,
  ) {
    return this.authService.sendEmailVerificationOtp(
      sendEmailVerificationOtpDto.email,
    );
  }

  @Post('send/phone/verification')
  @ApiOperation({ summary: 'Send phone verification code' })
  @ApiResponse({
    status: 200,
    description: 'Verification code sent successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  sendPhoneVerificationOtp(
    @Body() sendPhoneVerificationOtpDto: SendPhoneCodeDto,
  ) {
    return this.authService.sendPhoneVerificationOtp(
      sendPhoneVerificationOtpDto.phone,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async authWithGoogle() {}

  @HttpCode(HttpStatus.OK)
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const redirectUrl = `${process.env.LOGIN_SUCCESS_REDIRECT_URL}?token=${req.user.access_token}`;
    return res.redirect(redirectUrl);
  }

  @HttpCode(HttpStatus.OK)
  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  async authWithFacebook() {}

  @HttpCode(HttpStatus.OK)
  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  async facebookAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const redirectUrl = `${process.env.LOGIN_SUCCESS_REDIRECT_URL}?token=${req.user.access_token}`;
    return res.redirect(redirectUrl);
  }

  @Post('verify/email')
  @ApiOperation({ summary: 'Verify email with code' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  verifyEmail(@Body() verifyDto: VerifyDto) {
    return this.authService.verifyEmail(verifyDto);
  }

  @Post('verify/phone')
  @ApiOperation({ summary: 'Verify phone with code' })
  @ApiResponse({ status: 200, description: 'Phone verified successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  verifyPhone(@Body() verifyDto: VerifyDto) {
    return this.authService.verifyPhone(verifyDto);
  }

  @Post('forget-password')
  @ApiOperation({ summary: 'Send forget password code' })
  @ApiResponse({ status: 200, description: 'Reset code sent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  sendForgetPasswordOtp(@Body() sendForgetPasswordOtpDto: ForgetPasswordDto) {
    return this.authService.sendForgetPasswordOtp(
      sendForgetPasswordOtpDto.email,
      sendForgetPasswordOtpDto.phone,
    );
  }

  @Post('update-email')
  @ApiOperation({ summary: 'Update email' })
  @ApiResponse({ status: 200, description: 'Email updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  updateEmail(@Body() updateEmailDto: UpdateEmailDto, @Req() req: Request) {
    return this.authService.updateEmail(req.user._id, updateEmailDto.email);
  }

  @Post('update-password')
  @ApiOperation({ summary: 'Update password' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Req() req: Request,
  ) {
    return this.authService.updatePassword(req.user._id, updatePasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with code' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
