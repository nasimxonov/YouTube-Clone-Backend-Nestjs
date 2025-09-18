import { Get, Req, Res, UseGuards, Controller } from '@nestjs/common';
import { OAuthService } from './oauth.service';
import { AuthGuard as GoogleGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('auth')
export class OAuthController {
  constructor(private readonly authService: OAuthService) {}

  @Get('google')
  @UseGuards(GoogleGuard('google'))
  googleAuthRedirect() {}

  @Get('google/callback')
  @UseGuards(GoogleGuard('google'))
  async oauthGoogleCallback(@Req() req: Request, @Res() res: Response) {
    console.log(req['user']);
    const user = req['user'];
    console.log('nasimxonovS');
    const token = await this.authService.oauthGoogleCallback(user);
    res.cookie('token', token, {
      maxAge: 1.1 * 3600 * 1000,
      httpOnly: true,
    });
    const url = process.env.FRONT_HOMEPAGE_URL as string;
    return res.redirect(url);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Req() req: Request) {
    const userId = req['userId'];
    return await this.authService.getMe(userId);
  }
}
