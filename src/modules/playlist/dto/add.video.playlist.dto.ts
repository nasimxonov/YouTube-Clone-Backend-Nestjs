import { IsNumber, IsString } from 'class-validator';

export class AddVideoPlaylistDto {
  @IsString()
  videoId: string;

  @IsNumber()
  position: number;
}
