import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { AddVideoPlaylistDto } from './dto/add.video.playlist.dto';

@Injectable()
export class PlaylistService {
  constructor(private readonly db: PrismaService) {}

  async createPlaylist(playlistData: CreatePlaylistDto, userId: string) {
    const findUser = await this.db.prisma.users.findFirst({
      where: { id: userId },
    });
    if (!findUser) throw new NotFoundException('User not found');
    const result = await this.db.prisma.playlist.create({
      data: { ...playlistData, authorId: userId },
    });
    return result;
  }

  async addVideoPlaylist(id: string, data: AddVideoPlaylistDto) {
    const findPlaylist = await this.db.prisma.playlist.findFirst({
      where: { id },
    });
    if (!findPlaylist) throw new NotFoundException('Playlist not found');
    const findVideo = await this.db.prisma.video.findFirst({
      where: { id: data.videoId },
    });
    if (!findVideo) throw new NotFoundException('Video not found');
    const result = await this.db.prisma.playlistVideo.create({
      data: { ...data, playlistId: id },
    });
    return result;
  }

  async getPlaylist(id: string) {
    const findPlaylist = await this.db.prisma.playlist.findFirst({
      where: { id },
      include: { videos: true },
    });
    if (!findPlaylist) throw new NotFoundException('Playlist not found');
    return findPlaylist;
  }

  async getUserPlaylists(userId: string, page: number, limit: number) {
    const parsedLimit = Number(limit) || 10;
    const parsedPage = Number(page) || 1;
    const findUser = await this.db.prisma.users.findFirst({
      where: { id: userId },
    });
    if (!findUser) throw new NotFoundException('User not found');
    const offset = (parsedPage - 1) * parsedLimit;
    const playlists = await this.db.prisma.playlist.findMany({
      where: { authorId: userId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            channelName: true,
            avatar: true,
            is_email_verified: true,
          },
        },
        _count: {
          select: {
            videos: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: offset,
      take: parsedLimit,
    });
    const totalPlaylists = await this.db.prisma.playlist.count({
      where: { authorId: userId },
    });
    const totalPages = Math.ceil(totalPlaylists / parsedLimit);

    return {
      playlists,
      pagination: {
        currentPage: parsedPage,
        totalPages,
        totalPlaylists,
        limit: parsedLimit,
        hasNextPage: parsedPage < totalPages,
        hasPreviousPage: parsedPage > 1,
      },
    };
  }

  async updatePlaylist(id: string, data: UpdatePlaylistDto) {
    const findPlaylist = await this.db.prisma.playlist.findFirst({
      where: { id },
    });
    if (!findPlaylist) throw new NotFoundException('Playlist not found');

    const result = await this.db.prisma.playlist.update({
      where: { id },
      data,
    });
    return result;
  }

  async deleteVideoFromPlaylist(id: string, videoId: string) {
    const findPlaylist = await this.db.prisma.playlist.findFirst({
      where: { id },
    });
    if (!findPlaylist) throw new NotFoundException('Playlist not found');
    const findVideo = await this.db.prisma.video.findFirst({
      where: { id: videoId },
    });
    if (!findVideo) throw new NotFoundException('Video not found');
    const result = await this.db.prisma.playlistVideo.deleteMany({
      where: {
        playlistId: id,
        videoId: videoId,
      },
    });
    if (result.count === 0) {
      throw new NotFoundException('Video is not in this playlist');
    }

    return {
      message: 'Video successfully removed from playlist',
    };
  }
}
