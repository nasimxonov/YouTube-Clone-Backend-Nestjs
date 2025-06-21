export class CreatePlaylistDto {
  title: string;
  description?: string;
  visibility: 'PUBLIC' | 'UNLISTED' | 'PRIVATE';
}

export class AddVideoToPlaylistDto {
  videoId: string;
  position: number;
}

export class UpdatePlaylistDto {
  title?: string;
  description?: string;
  visibility?: 'PUBLIC' | 'UNLISTED' | 'PRIVATE';
}
