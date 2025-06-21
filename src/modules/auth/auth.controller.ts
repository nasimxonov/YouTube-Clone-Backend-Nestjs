import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Res,
  Get,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { EmailOtpService } from './email.service';
import { SendOtpDto } from './dto/send-otp.dto';
import VerifyOtpDto from './dto/verify.otp.dto';
import { CreateAuthDto } from './dto/create-auth.dto';
import { sendCodeLoginDto, verifyCodeLoginDto } from './dto/login-auth.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailOtpService: EmailOtpService,
  ) {}

  @Post('send-otp')
  async sendOtpUser(@Body() sendOtpDto: SendOtpDto) {
    const response = await this.authService.sendOtpUser(sendOtpDto);
    return response;
  }

  @Post('verify-otp')
  async verifyOtp(@Body() data: VerifyOtpDto) {
    return await this.authService.verifyOtp(data);
  }

  @Post('register')
  async register(
    @Body() createAuthDto: CreateAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.register(createAuthDto);
    res.cookie('token', token, {
      maxAge: 1.1 * 3600 * 1000,
      httpOnly: true,
    });
    return { token };
  }

  @Post('send-code-login')
  async sendCodeLogin(@Body() data: sendCodeLoginDto) {
    try {
      const response = await this.authService.sendCodeLogin(data);
      return response;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('verify-login')
  async verifyLogin(
    @Body() data: verifyCodeLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const token = await this.authService.verifyCodeLogin(data);
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 1.1 * 3600 * 1000,
      });
      return { token };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('send-email-link')
  async sendEmailLink(@Body('email') email: string) {
    try {
      const token = await this.emailOtpService.sendEmailLink(email);
      return {
        message: 'Email muvaffaqiyatli yuborildi',
        token,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    if (!token) {
      throw new HttpException('Token topilmadi', HttpStatus.BAD_REQUEST);
    }

    const data = await this.emailOtpService.getEmailToken(token);
    if (!data) {
      throw new HttpException(
        "Token eskirgan yoki notog'ri",
        HttpStatus.BAD_REQUEST,
      );
    }

    return JSON.parse(data);
  }
}
