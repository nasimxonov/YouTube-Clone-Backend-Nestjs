import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.CLIENT_ID_GOOGLE as string,
      clientSecret: process.env.CLIENT_SECRET_GOOGLE as string,
      callbackURL: process.env.CLIENT_CALLBACK_URL_GOOGLE as string,
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): any {
    const user = {
      email: profile.emails?.[0]?.value,
      fullName:
        `${profile.name?.givenName ?? ''} ${profile.name?.familyName ?? ''}`.trim(),
      photo: profile.photos?.[0]?.value,
      provider: profile.provider,
      googleId: profile.id,
      accessToken,
    };

    done(null, user);
  }
}
