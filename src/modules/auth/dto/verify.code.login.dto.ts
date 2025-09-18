import { IsString } from 'class-validator';

export class VerifyCodeLoginDto {
  @IsString()
  phoneNumber: string;

  @IsString()
  code: string;
}
