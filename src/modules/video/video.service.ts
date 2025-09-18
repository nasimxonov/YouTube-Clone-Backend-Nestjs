import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import path from 'path';
import { PrismaService } from 'src/core/database/prisma.service';
import VideoServices from 'src/core/video.service';
import fs from 'fs';
import { Response } from 'express';
import { CreateVideoDto } from './dto/create-video.dto';
import deleteFile from 'src/common/utils/delete.file';
import { UpdateVideoDto } from './dto/update-video.dto';

@Injectable()
export class VideoService {
  constructor(
    private videoService: VideoServices,
    private db: PrismaService,
  ) {}
  async uploadVideo(
    file: Express.Multer.File,

    videoData: CreateVideoDto,
    id: string,
    thumbnail: Express.Multer.File,
  ) {
    const findChannel = await this.db.prisma.users.findFirst({ where: { id } });
    if (!findChannel) {
      await deleteFile(file.filename);
      throw new NotFoundException('Channel not found');
    }
    const fileName = file.filename;
    const fileNameData = path.join(
      process.cwd(),
      'uploads',
      fileName.split('.')[0],
    );
    const videoPath = path.join(process.cwd(), 'uploads', fileName);
    const resolution: any =
      await this.videoService.getVideoResolution(videoPath);
    const resolutions = [
      { height: 240 },
      { height: 360 },
      { height: 480 },
      { height: 720 },
      { height: 1080 },
    ];

    const validResolutions = resolutions.filter(
      (r) => r.height <= resolution.height + 6,
    );

    if (validResolutions.length > 0) {
      fs.mkdir(
        path.join(process.cwd(), 'uploads', 'videos', fileName.split('.')[0]),
        {
          recursive: true,
        },
        (err) => {
          if (err) throw new InternalServerErrorException(err);
        },
      );
      await Promise.all(
        this.videoService.convertToResolutions(
          videoPath,
          path.join(process.cwd(), 'uploads', 'videos', fileName.split('.')[0]),
          validResolutions,
        ),
      );
      fs.unlinkSync(videoPath);
      const result = await this.db.prisma.video.create({
        data: {
          ...videoData,
          categoryId: videoData.categoryId || null,
          videoUrl: fileNameData,
          authorId: id,
          status: 'PUBLISHED',
          thumbnail: `http://${process.env.HOST}:${process.env.PORT}/uploads/thumbnails/${thumbnail.filename}`,
        },
      });
      return {
        message: 'Video uploaded successfully',
        data: result,
      };
    } else {
      fs.unlinkSync(videoPath);
      throw new BadRequestException(
        'Video sifati juda past, iltimos sifatli video yuklang',
      );
    }
  }

  async watchVideo(id: string, quality: string, range: string, res: Response) {
    const findVideo = await this.db.prisma.video.findFirst({ where: { id } });
    // console.log(findVideo);
    if (!findVideo) {
      throw new NotFoundException('Video not found');
    }
    const fileName = findVideo.videoUrl.split(`/`).at(-1);
    const baseQuality = `${quality}.mp4`;
    const basePath = path.join(process.cwd(), 'uploads', 'videos');
    const readDir = fs.readdirSync(basePath);
    const videoActivePath = path.join(
      basePath,
      fileName as string,
      baseQuality,
    );
    // console.log(readDir, fileName);

    if (!readDir.includes(fileName as string))
      throw new NotFoundException('video not found');
    const innerVideoDir = fs.readdirSync(
      path.join(basePath, fileName as string),
    );
    if (!innerVideoDir.includes(baseQuality))
      throw new NotFoundException('video quality not found');
    const { size } = fs.statSync(videoActivePath);
    if (!range) {
      range = `bytes=0-1048575`;
    }

    const { start, end, chunkSize } = this.videoService.getChunkProps(
      range,
      size,
    );
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4',
    });
    const videoStream = fs.createReadStream(videoActivePath, {
      start,
      end,
    });
    let bytes = 0;
    videoStream.on('data', (data) => {
      bytes += data.length / 1024;
    });
    videoStream.on('end', () => {
      console.log(bytes);
    });
    videoStream.on('error', (err) => {
      console.log(err);
    });
    videoStream.pipe(res);

    await this.db.prisma.video.update({
      where: { id },
      data: { viewsCount: findVideo.viewsCount + 1 },
    });
    await this.db.prisma.users.update({
      where: { id: findVideo.authorId },
      data: {
        totalViews: {
          increment: 1,
        },
      },
    });
    const findWatchHistory = await this.db.prisma.watchHistory.findFirst({
      where: { videoId: findVideo.id, userId: findVideo.authorId },
    });
    if (!findWatchHistory) {
      await this.db.prisma.watchHistory.create({
        data: {
          watchTime: 200,
          userId: findVideo.authorId,
          videoId: findVideo.id,
        },
      });
    }
  }

  async getVideoDetails(id: string) {
    const findVideo = await this.db.prisma.video.findFirst({
      where: { id },
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
      },
    });
    if (!findVideo) throw new NotFoundException('Video not found');
    return findVideo;
  }

  async updateVideo(id: string, videoData: UpdateVideoDto) {
    const findVideo = await this.db.prisma.video.findFirst({ where: { id } });
    if (!findVideo) throw new NotFoundException('Video not found');
    const result = await this.db.prisma.video.update({
      where: { id },
      data: videoData,
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
      },
    });
    return { message: 'video successfull updated', data: result };
  }

  async deleteVideo(id: string) {
    const findVideo = await this.db.prisma.video.findFirst({ where: { id } });
    if (!findVideo) throw new NotFoundException('video not found');
    const fileName = path.basename(findVideo.videoUrl);
    const videoFolderPath = path.join(
      process.cwd(),
      'uploads',
      'videos',
      fileName,
    );
    await deleteFile(videoFolderPath);
    await this.db.prisma.video.delete({ where: { id } });
    return { message: 'Video successful deleted' };
  }

  async getVideosFeed(page: number, limit: number, categoryId?: string) {
    const offset = (page - 1) * limit;

    let where: any = {
      status: 'PUBLISHED',
    };

    const findCategory = await this.db.prisma.category.findFirst({where: {id: categoryId}})

    if (findCategory) {
      where.categoryId = categoryId;
    }
 

    const videos = await this.db.prisma.video.findMany({
      where,
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
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: offset,
      take: limit,
    });

    const totalVideos = await this.db.prisma.video.count({ where });
    const totalPages = Math.ceil(totalVideos / limit);
    // console.log(videos);
    
    return {
      videos,
      pagination: {
        currentPage: page,
        totalPages,
        totalVideos,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
