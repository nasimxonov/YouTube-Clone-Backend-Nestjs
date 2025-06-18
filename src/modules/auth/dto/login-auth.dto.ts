import { IsString } from 'class-validator';

export class sendCodeLoginDto {
  @IsString()
  phone_number: string;
  @IsString()
  password: string;
}

export class verifyCodeLoginDto {
  @IsString()
  code: string;
  @IsString()
  phone_number: string;
}
