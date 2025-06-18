import { IsString } from "class-validator";

class VerifyOtpDto {
  @IsString()
  phone_number: string;
  @IsString()
  code: string;
}
export default VerifyOtpDto;
