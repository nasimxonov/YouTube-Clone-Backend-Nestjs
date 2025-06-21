import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async recordView(
    videoId: string,
    userId: string | null,
    body: {
      watchTime: number;
      quality: string;
      device: string;
      location: string;
    },
  ) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
    });
    if (!video) throw new NotFoundException('Video not found');

    await this.prisma.video.update({
      where: { id: videoId },
      data: {
        viewsCount: { increment: 1 },
      },
    });

    if (userId) {
      await this.prisma.watchHistory.upsert({
        where: {
          userId_videoId: {
            userId,
            videoId,
          },
        },
        update: { watchTime: body.watchTime },
        create: {
          userId,
          videoId,
          watchTime: body.watchTime,
        },
      });
    }

    return { success: true, message: 'View recorded' };
  }

  async getAnalytics(videoId: string, userId: string, timeframe: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      include: { author: true },
    });
    if (!video || video.authorId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to view analytics of this video',
      );
    }

    const views = await this.prisma.watchHistory.findMany({
      where: { videoId },
    });

    const totalViews = views.length;
    const totalWatchTime = views.reduce((sum, view) => sum + view.watchTime, 0);
    const averageViewDuration = totalViews
      ? Math.floor(totalWatchTime / totalViews)
      : 0;

    return {
      success: true,
      data: {
        totalViews,
        totalWatchTime,
        averageViewDuration,
        viewsByDay: [],
        viewsByCountry: [],
        deviceBreakdown: {},
        retention: [],
      },
    };
  }
}
