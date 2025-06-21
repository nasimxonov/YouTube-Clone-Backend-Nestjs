import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Query,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { AuthGuard } from 'src/common/guard/auth.guard';
import {
  AddVideoToPlaylistDto,
  CreatePlaylistDto,
  UpdatePlaylistDto,
} from './dto/playlist.dto';

@Controller('playlists')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createPlaylist(
    @Body() dto: CreatePlaylistDto,
    @Query('userId') userId: string,
  ) {
    return this.playlistService.createPlaylist(userId, dto);
  }

  @UseGuards(AuthGuard)
  @Post(':id/videos')
  async addVideoToPlaylist(
    @Param('id') id: string,
    @Body() dto: AddVideoToPlaylistDto,
  ) {
    return this.playlistService.addVideoToPlaylist(id, dto);
  }

  @Get(':id')
  async getPlaylist(@Param('id') id: string) {
    return this.playlistService.getPlaylist(id);
  }

  @Get('/user/:userId')
  async getUserPlaylists(
    @Param('userId') userId: string,
    @Query('limit') limit: string,
    @Query('page') page: string,
  ) {
    const limitNum = parseInt(limit) || 20;
    const pageNum = parseInt(page) || 1;
    return this.playlistService.getUserPlaylists(userId, limitNum, pageNum);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async updatePlaylist(
    @Param('id') id: string,
    @Body() dto: UpdatePlaylistDto,
  ) {
    return this.playlistService.updatePlaylist(id, dto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id/videos/:videoId')
  async removeVideo(
    @Param('id') id: string,
    @Param('videoId') videoId: string,
  ) {
    return this.playlistService.removeVideo(id, videoId);
  }
}
