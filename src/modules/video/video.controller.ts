import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Request,
  Get,
  Param,
  Query,
  Res,
  Put,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { VideoService } from './video.service';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RoleGuard } from 'src/common/guard/role.guard';
import { SetMetadata } from '@nestjs/common';
import { extname } from 'path';
import { Response } from 'express';

@UseGuards(AuthGuard, RoleGuard)
@SetMetadata('roles', ['USER'])
@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const fileExt = extname(file.originalname);
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
          callback(null, uniqueName);
        },
      }),
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
    @Body('title') title: string,
    @Body('description') description?: string,
  ) {
    return this.videoService.uploadVideo(file, req.user.id, title, description);
  }

  @Get('watch/:id')
  async watch(
    @Param('id') id: string,
    @Query('quality') quality: string,
    @Res() res: Response,
    @Request() req,
  ) {
    const range = req.headers.range || '';
    return this.videoService.watchVideo(id, quality || '720', range, res);
  }

  @Get(':id/status')
  async getStatus(@Param('id') id: string) {
    return this.videoService.getVideoStatus(id);
  }

  @Get(':id')
  async getDetails(@Param('id') id: string) {
    return this.videoService.getVideoDetails(id);
  }

  @Put(':id')
  async updateVideo(
    @Param('id') id: string,
    @Request() req,
    @Body() body: any,
  ) {
    return this.videoService.updateVideo(id, req.user.id, body);
  }
  @Delete(':id')
  async deleteVideo(@Param('id') id: string, @Request() req) {
    return this.videoService.deleteVideo(id, req.user.id);
  }

  @Get('feed')
  async getFeed(@Query() query: any) {
    return this.videoService.getVideoFeed(query);
  }

  @Get('search')
  async search(
    @Query('q') q: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.videoService.searchVideos(
      q,
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @Get('trending')
  async trending(
    @Query('category') category: string,
    @Query('region') region: string,
    @Query('timeframe') timeframe: string,
  ) {
    return this.videoService.getTrendingVideos(
      category || 'all',
      region || 'global',
      timeframe || '24h',
    );
  }
}