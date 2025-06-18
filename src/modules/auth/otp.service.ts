import { BadRequestException, Injectable } from '@nestjs/common';
import RedisService from 'src/core/database/redis.service';
import { generate } from 'otp-generator';
import SmsService from './sms.service';
import OtpSecurityService from './otp.security.service';
import * as crypto from 'crypto';

@Injectable()
class OtpService {
  constructor(
    private redisService: RedisService,
    private smsService: SmsService,
    private otpSecurityService: OtpSecurityService,
  ) {}

  private generateOtp() {
    return generate(6, {
      digits: true,
      specialChars: false,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
    });
  }

  public getSessionToken() {
    return crypto.randomUUID();
  }

  async sendOtp(phone_number: string) {
    await this.otpSecurityService.checkIfTemporaryBlockedUser(phone_number);

    await this.checkOtpExisted(phone_number);

    const tempOtp = this.generateOtp();
    const responseRedis = await this.redisService.setOtp(phone_number, tempOtp);

    if (responseRedis === 'OK') {
      await this.smsService.sendSms(phone_number, tempOtp);
      return true;
    }
  }

  async checkOtpExisted(phone_number: string) {
    const key = `user:${phone_number}`;

    const checkOtp = await this.redisService.getOtp(key);
    if (checkOtp) {
      const ttl = await this.redisService.getTTLKey(key);
      throw new BadRequestException(`Please try again after ${ttl} seconds`);
    }
  }

  async verifyOtpSendedUser(phone_number: string, code: string) {
    await this.otpSecurityService.checkIfTemporaryBlockedUser(phone_number);

    const key = `user:${phone_number}`;
    const otp = await this.redisService.getOtp(key);

    if (!otp) {
      throw new BadRequestException('invalid code');
    }

    if (otp !== code) {
      const attempts =
        await this.otpSecurityService.recordFailedOtpAttempts(phone_number);
      throw new BadRequestException({
        message: 'invalid code',
        attempts: `You have ${attempts} attempts`,
      });
    }

    await this.redisService.delKey(key);
    await this.otpSecurityService.delOtpAttempts(
      `otp_attempts:${phone_number}`,
    );

    const sessionToken = this.getSessionToken();
    await this.redisService.setSessionTokenUser(phone_number, sessionToken);

    return sessionToken;
  }

  async checkSessionTokenUser(key: string, token: string) {
    
    const sessionToken = await this.redisService.getKey(key);
    
    if (!sessionToken || sessionToken !== token)
      throw new BadRequestException('session token expired');
  }

  async delSessionTokenUser(key: string) {
    await this.redisService.delKey(key);
  }

  
}

export default OtpService;
