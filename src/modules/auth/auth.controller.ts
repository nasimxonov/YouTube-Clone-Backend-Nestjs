import {
  Controller,
  Post,
  Body,
  Res,
  SetMetadata,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login.auth.dto';

@Controller('auth')
@SetMetadata('isFreeAuth', true)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: RegisterAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.authService.register(body);
    res.cookie('token', data.token, {
      maxAge: 2.1 * 3600 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
    return data;
  }

  @Post('login-with-password')
  @HttpCode(200)
  async loginWithPassword(
    @Body() data: LoginAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.loginWithPassword(data);
    res.cookie('token', token, {
      maxAge: 2.1 * 3600 * 1000,
      httpOnly: true,
    });
    return { token };
  }
}
