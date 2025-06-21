import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import fs from 'fs';
import path from 'path';
import { Response } from 'express';
import VideoConvertService from './video_convert.service';

@Injectable()
export class VideoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly videoService: VideoConvertService,
  ) {}

  async uploadVideo(
    file: Express.Multer.File,
    userId: string,
    title: string,
    description?: string,
  ) {
    if (!userId) throw new Error('Foydalanuvchi aniqlanmadi');

    const fileName = file.filename;
    const videoPath = path.join(process.cwd(), 'uploads', fileName);

    const resolution: any =
      await this.videoService.getVideoResolution(videoPath);
    const duration = await this.videoService.getDuration(videoPath);

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

    if (validResolutions.length === 0) {
      fs.unlinkSync(videoPath);
      return { message: 'Video past sifatli' };
    }

    const folderPath = path.join(
      process.cwd(),
      'uploads',
      'videos',
      fileName.split('.')[0],
    );

    fs.mkdirSync(folderPath, { recursive: true });

    await Promise.all(
      this.videoService.convertToResolutions(
        videoPath,
        folderPath,
        validResolutions,
      ),
    );

    fs.unlinkSync(videoPath);

    const finalVideoUrl = `/uploads/videos/${fileName.split('.')[0]}/720.mp4`;

    await this.prisma.video.create({
      data: {
        title,
        description,
        videoUrl: finalVideoUrl,
        duration,
        author: {
          connect: { id: userId },
        },
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
      },
    });

    return { message: 'Video muvaffaqiyatli yuklandi' };
  }

  async watchVideo(id: string, quality: string, range: string, res: Response) {
    const baseQuality = `${quality}.mp4`;
    const videoPath = path.join(
      process.cwd(),
      'uploads',
      'videos',
      id,
      baseQuality,
    );
    if (!fs.existsSync(videoPath)) {
      throw new NotFoundException('Video file not found on server');
    }
    const { size } = fs.statSync(videoPath);
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
    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
    videoStream.on('error', (err) => {
      console.error('Stream error:', err);
      res.sendStatus(500);
    });
  }
  async getVideoStatus(videoId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        status: true,
        videoUrl: true,
      },
    });

    if (!video) {
      throw new NotFoundException('Video topilmadi');
    }

    return {
      success: true,
      data: {
        id: video.id,
        status: video.status,
        processingProgress: video.status === 'PUBLISHED' ? 100 : 65,
        availableQualities: ['720p'],
        estimatedTimeRemaining:
          video.status === 'PUBLISHED' ? '0 minutes' : '2-5 minutes',
      },
    };
  }

  async getVideoDetails(videoId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      include: {
        author: true,
        comments: true,
        likes: true,
      },
    });

    if (!video) {
      throw new NotFoundException('Video topilmadi');
    }

    return {
      success: true,
      data: {
        id: video.id,
        title: video.title,
        description: video.description,
        thumbnail:
          video.thumbnail ||
          `https://cdn.example.com/thumbnails/${video.id}.jpg`,
        videoUrl: `https://cdn.example.com${video.videoUrl}`,
        availableQualities: ['1080p', '720p', '480p', '360p'],
        duration: video.duration,
        viewsCount: Number(video.viewsCount),
        likesCount: video.likesCount,
        dislikesCount: video.dislikesCount,
        commentsCount: video.comments.length,
        publishedAt: video.createdAt.toISOString(),
        author: {
          id: video.author.id,
          username: video.author.username,
          channelName: video.author.firstName + ' ' + video.author.lastName,
          avatar: video.author.avatar,
          subscribersCount: 0,
          isVerified: true,
        },
        tags: [],
        category: video['category'] || 'General',
      },
    };
  }

  async updateVideo(videoId: string, userId: string, body: any) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video || video.authorId !== userId) {
      throw new NotFoundException('Video topilmadi yoki ruxsat yo‘q');
    }

    await this.prisma.video.update({
      where: { id: videoId },
      data: {
        title: body.title,
        description: body.description,
        visibility: body.visibility,
      },
    });

    return { message: 'Video yangilandi' };
  }
  async deleteVideo(videoId: string, userId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video || video.authorId !== userId) {
      throw new NotFoundException("Video topilmadi yoki ruxsat yo'q");
    }

    await this.prisma.video.delete({ where: { id: videoId } });

    return { message: "Video o'chirildi" };
  }

  async getVideoFeed(query: any) {
    const { page = 1, limit = 20, category, duration, sort } = query;
    const skip = (page - 1) * limit;

    let whereClause: any = { visibility: 'PUBLIC' };

    if (category) whereClause.category = category;

    const orderBy: any = {};

    if (sort === 'popular') orderBy.viewsCount = 'desc';
    else if (sort === 'newest') orderBy.createdAt = 'desc';
    else if (sort === 'oldest') orderBy.createdAt = 'asc';

    const videos = await this.prisma.video.findMany({
      where: whereClause,
      take: Number(limit),
      skip,
      orderBy,
    });

    return { success: true, data: videos };
  }

  async searchVideos(query: string, page = 1, limit = 20) {
    const videos = await this.prisma.video.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
        visibility: 'PUBLIC',
      },
      take: Number(limit),
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, data: videos };
  }
  
  async getTrendingVideos(category: string, region: string, timeframe: string) {
    const videos = await this.prisma.video.findMany({
      where: {
        visibility: 'PUBLIC',
      },
      take: 20,
      orderBy: {
        viewsCount: 'desc',
      },
    });

    return { success: true, data: videos };
  }
}
