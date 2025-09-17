import { IsOptional, IsString } from 'class-validator';

export class UpdateChannelDto {
  @IsOptional()
  @IsString()
  channelName: string;

  @IsOptional()
  @IsString()
  channelDescription: string;
}
