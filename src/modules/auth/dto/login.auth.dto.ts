import { IsEmail, IsString } from 'class-validator';

export class LoginAuthDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  password: string;
}
