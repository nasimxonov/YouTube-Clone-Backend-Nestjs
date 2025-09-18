import { Module } from '@nestjs/common';
import { OAuthService } from './oauth.service';
import { OAuthController } from './oauth.controller';
import { GoogleStrategy } from './strategies/google.strategies';

@Module({
  controllers: [OAuthController],
  providers: [OAuthService, GoogleStrategy],
})
export class OAuthModule {}
