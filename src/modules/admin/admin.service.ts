import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalVideos,
      totalViews,
      totalWatchTime,
      newUsersToday,
      newVideosToday,
      viewsToday,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.video.count(),
      this.prisma.video.aggregate({ _sum: { viewsCount: true } }),
      this.prisma.watchHistory.aggregate({ _sum: { watchTime: true } }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      this.prisma.video.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      this.prisma.watchHistory.count({
        where: {
          watchedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    const topCategories = [
      { category: 'Entertainment', count: 50000 },
      { category: 'Education', count: 35000 },
    ];

    return {
      totalUsers,
      totalVideos,
      totalViews: totalViews._sum.viewsCount || 0,
      totalWatchTime: totalWatchTime._sum.watchTime || 0,
      newUsersToday,
      newVideosToday,
      viewsToday,
      topCategories,
      storageUsed: '500TB',
      bandwidthUsed: '50TB',
    };
  }

  async getPendingVideos(limit: number, page: number) {
    return this.prisma.video.findMany({
      where: { status: 'PROCESSING' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async approveVideo(id: string) {
    return this.prisma.video.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });
  }

  async rejectVideo(id: string) {
    return this.prisma.video.update({
      where: { id },
      data: { status: 'DELETED' },
    });
  }

  getUsers(limit: number, page: number, search?: string, status?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) {
      where.status = status;
    }
    return this.prisma.user.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  async blockUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { is_email_verified: false },
    });
  }

  async verifyUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { is_email_verified: true },
    });
  }

  async getReports(type: string, status: string, limit: number, page: number) {
    return {
      data: [],
      total: 0,
    };
  }

  async resolveReport(id: string) {
    return {
      message: `Report ${id} resolved.`,
    };
  }
}
