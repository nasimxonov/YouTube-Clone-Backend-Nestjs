import { IsBoolean, IsOptional } from 'class-validator';

export class SubscribeDto {
  @IsOptional()
  @IsBoolean()
  notificationEnabled: boolean;
}
