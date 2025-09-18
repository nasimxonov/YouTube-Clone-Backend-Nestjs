import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  SetMetadata,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { diskStorage } from 'multer';
import path from 'path';
import { RoleGuard } from 'src/common/guards/role.guard';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { VideoService } from './video.service';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}
  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req: Request, file, callback) => {
            if (file.fieldname === 'thumbnail') {
              callback(null, 'uploads/thumbnails');
            } else {
              callback(null, 'uploads');
            }
          },
          filename: (req: Request, file, callback) => {
            const ext = path.extname(file.originalname);
            const fileName = `${Date.now()}${ext}`;
            callback(null, fileName);
          },
        }),
      },
    ),
  )
  async uploadVideo(
    @Body() body: CreateVideoDto,
    @Req() req: Request,
    @UploadedFiles()
    files: { file: Express.Multer.File; thumbnail: Express.Multer.File },
  ) {
    const userId = req['userId'];
    return await this.videoService.uploadVideo(
      files.file[0],
      body,
      userId,
      files.thumbnail[0],
    );
  }

  @Get(':id/stream')
  @SetMetadata('isFreeAuth', true)
  async watchVideo(
    @Param('id') id: string,
    @Query('quality') quality: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const param = id;
    const contentRange = req.headers.range;
    await this.videoService.watchVideo(
      param,
      quality,
      contentRange as string,
      res,
    );
  }

  @Get(':id')
  @SetMetadata('isFreeAuth', true)
  async getVideoDetails(@Param('id') id: string) {
    return await this.videoService.getVideoDetails(id);
  }
  @Put(':id')
  async updateVideo(@Param('id') id: string, @Body() body: UpdateVideoDto) {
    return await this.videoService.updateVideo(id, body);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['SUPERADMIN', 'ADMIN', 'OWNER'])
  async deleteVideo(@Param('id') id: string) {
    return await this.videoService.deleteVideo(id);
  }

  @Get('feed/videos')
  @SetMetadata('isFreeAuth', true)
  async getVideosFeed(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('categoryId') categoryId?: string,
  ) {
    return await this.videoService.getVideosFeed(page, limit, categoryId);
  }
}

