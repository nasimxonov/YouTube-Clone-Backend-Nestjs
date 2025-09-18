import { Get, Req, Res, UseGuards, Controller } from '@nestjs/common';
import { OAuthService } from './oauth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Controller('auth')
export class OAuthController {
  constructor(private readonly authService: OAuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async oauthGoogleCallback(@Req() req: Request, @Res() res: Response) {
    const user = req['user'];
    console.log('nasimxonovS');
    const token = await this.authService.oauthGoogleCallback(user);
    res.cookie('token', token, {
      maxAge: 1.1 * 3600 * 1000,
      httpOnly: true,
    });
    return res.redirect('http://192.168.34.219:5173');
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Req() req: Request) {
    const { id, role } = req['userId'];
    return await this.authService.getMe(id);
  }
}
