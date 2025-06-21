import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ResendModule } from 'nestjs-resend';
import { DatabaseModule } from 'src/core/database/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { EmailOtpService } from './email.service';
import { OtpSecurityService } from './otp.security.service';
import { SmsService } from './sms.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpService,
    SmsService,
    OtpSecurityService,
    EmailOtpService,
  ],
  exports: [],
})
export class AuthModule {}
