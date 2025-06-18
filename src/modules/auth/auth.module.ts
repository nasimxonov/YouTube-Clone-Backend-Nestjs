import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from 'src/core/database/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import OtpSecurityService from './otp.security.service';
import OtpService from './otp.service';
import SmsService from './sms.service';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: 'JWT_KEY',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService, SmsService, OtpSecurityService],
})
export class AuthModule {}
