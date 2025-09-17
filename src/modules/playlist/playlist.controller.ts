import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  SetMetadata,
  Query,
  Put,
} from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { Request } from 'express';
import { AddVideoPlaylistDto } from './dto/add.video.playlist.dto';

@Controller('playlists')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Post()
  async createPlaylist(@Body() body: CreatePlaylistDto, @Req() req: Request) {
    const userId = req['userId'];
    return this.playlistService.createPlaylist(body, userId);
  }

  @Post(':id/videos')
  async addVideoPlaylist(
    @Param('id') id: string,
    @Body() body: AddVideoPlaylistDto,
  ) {
    return await this.playlistService.addVideoPlaylist(id, body);
  }

  @Get(':id')
  @SetMetadata('isFreeAuth', true)
  async getPlaylists(@Param('id') id: string) {
    return await this.playlistService.getPlaylist(id);
  }

  @Get('users/:userid')
  @SetMetadata('isFreeAuth', true)
  async getUserPlaylists(
    @Param('userid') userId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.playlistService.getUserPlaylists(userId, page, limit);
  }

  @Put(':id')
  async updatePlaylist(
    @Param('id') id: string,
    @Body() body: UpdatePlaylistDto,
  ) {
    return await this.playlistService.updatePlaylist(id, body);
  }

  @Delete(':id/videos/:videoid')
  async deleteVideoFromPlaylis(
    @Param('id') id: string,
    @Param('videoid') videoId: string,
  ) {
    return await this.playlistService.deleteVideoFromPlaylist(id, videoId);
  }
}
