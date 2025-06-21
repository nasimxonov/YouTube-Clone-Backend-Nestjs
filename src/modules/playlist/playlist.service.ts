import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import {
  AddVideoToPlaylistDto,
  CreatePlaylistDto,
  UpdatePlaylistDto,
} from './dto/playlist.dto';

@Injectable()
export class PlaylistService {
  constructor(private readonly db: PrismaService) {}

  async createPlaylist(userId: string, dto: CreatePlaylistDto) {
    const playlist = await this.db.playlist.create({
      data: {
        authorId: userId,
        ...dto,
      },
    });
    return { success: true, data: playlist };
  }

  async addVideoToPlaylist(id: string, dto: AddVideoToPlaylistDto) {
    const playlist = await this.db.playlist.findUnique({ where: { id } });
    if (!playlist) throw new NotFoundException('Playlist topilmadi');

    const exists = await this.db.playlistVideo.findFirst({
      where: { playlistId: id, videoId: dto.videoId },
    });

    if (exists) return { success: false, message: 'Video allaqachon mavjud' };

    const added = await this.db.playlistVideo.create({
      data: {
        playlistId: id,
        videoId: dto.videoId,
        position: dto.position,
      },
    });

    return { success: true, data: added };
  }

  async getPlaylist(id: string) {
    const playlist = await this.db.playlist.findUnique({
      where: { id },
      include: {
        videos: {
          include: {
            video: true,
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
    });
    if (!playlist) throw new NotFoundException('Playlist topilmadi');
    return { success: true, data: playlist };
  }

  async getUserPlaylists(userId: string, limit = 20, page = 1) {
    const playlists = await this.db.playlist.findMany({
      where: { authorId: userId },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
    });
    const total = await this.db.playlist.count({ where: { authorId: userId } });
    return {
      success: true,
      data: {
        playlists,
        total,
        hasMore: page * limit < total,
      },
    };
  }

  async updatePlaylist(id: string, dto: UpdatePlaylistDto) {
    const updated = await this.db.playlist.update({
      where: { id },
      data: dto,
    });
    return { success: true, data: updated };
  }

  async removeVideo(playlistId: string, videoId: string) {
    await this.db.playlistVideo.delete({
      where: {
        playlistId_videoId: {
          playlistId,
          videoId,
        },
      },
    });
    return { success: true };
  }
}
