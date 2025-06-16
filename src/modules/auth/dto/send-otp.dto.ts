import { IsPhoneNumber, IsNotEmpty } from 'class-validator';

export class SendOtpDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  phone_number: string;
}
