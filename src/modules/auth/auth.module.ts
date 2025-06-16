import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from 'src/core/database/database.module';
import PrismaService from 'src/core/database/prisma.service';
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
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    OtpService,
    SmsService,
    OtpSecurityService,
  ],
})
export class AuthModule {}
