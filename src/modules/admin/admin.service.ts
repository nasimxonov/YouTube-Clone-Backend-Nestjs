import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private db: PrismaService) {}

  async adminDashboard(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const totalUsers = await this.db.prisma.users.count();
    const totalVideos = await this.db.prisma.video.count();

    const totalViewsData = await this.db.prisma.video.findMany({
      select: { viewsCount: true },
    });
    const totalViews = totalViewsData.reduce(
      (sum, video) => sum + Number(video.viewsCount),
      0,
    );

    const totalWatchTimeData = await this.db.prisma.video.findMany({
      select: { viewsCount: true, duration: true },
    });
    const totalWatchTime = totalWatchTimeData.reduce(
      (sum, video) => sum + Number(video.viewsCount) * video.duration,
      0,
    );

    const newUsersToday = await this.db.prisma.users.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const newVideosToday = await this.db.prisma.video.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const todayVideos = await this.db.prisma.video.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: { viewsCount: true },
    });
    const viewsToday = todayVideos.reduce(
      (sum, video) => sum + Number(video.viewsCount),
      0,
    );

    return {
      success: true,
      data: {
        totalUsers,
        totalVideos,
        totalViews,
        totalWatchTime,
        newUsersToday,
        newVideosToday,
        viewsToday,
      },
    };
  }
}
