import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    console.log('Google OAuth process started');
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user;
    const token = await this.authService.OAuthGoogleCallback(user);

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24,
    });
    return res.redirect('http://localhost:5173'); // frontni ipsi kerak
  }

  @Post('login')
  async login(
    @Body() data: { email: string; password: string },
    @Res() res: Response,
  ) {
    const token = await this.authService.login(data);

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24,
    });

    return res.json({ message: 'Login successful' });
  }

  @Post('register')
  async register(
    @Body()
    data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      username: string;
    },
    @Res() res: Response,
  ) {
    const token = await this.authService.register(data);

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24,
    });

    return res.json({ message: 'Registration successful' });
  }
}
