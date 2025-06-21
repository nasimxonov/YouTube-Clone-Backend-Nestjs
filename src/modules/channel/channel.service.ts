import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class ChannelService {
  constructor(private prisma: PrismaService) {}

  async getChannelInfo(username: string, viewerId?: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        channelName: true,
        channelDescription: true,
        channelBanner: true,
        totalViews: true,
        createdAt: true,
        is_email_verified: true,
        _count: {
          select: {
            subscribers: true,
            videos: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Channel not found');
    }

    let isSubscribed: boolean | null = null;

    if (viewerId) {
      const sub = await this.prisma.subscription.findUnique({
        where: {
          subscriberId_channelId: {
            subscriberId: viewerId,
            channelId: user.id,
          },
        },
      });

      isSubscribed = !!sub;
    }

    return {
      id: user.id,
      username: user.username,
      channelName: user.channelName || `${user.firstName} ${user.lastName}`,
      channelDescription: user.channelDescription || '',
      avatar: user.avatar || null,
      channelBanner: user.channelBanner || null,
      subscribersCount: user._count.subscribers,
      totalViews: user.totalViews || 0,
      videosCount: user._count.videos,
      joinedAt: user.createdAt,
      isVerified: user.is_email_verified,
      isSubscribed: isSubscribed,
    };
  }

  async getChannelVideos(
    username: string,
    limit: number,
    page: number,
    sort: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return (
      await this.prisma.video.findMany({
        where: {
          authorId: user.id,
          visibility: 'PUBLIC',
          status: 'PUBLISHED',
        },
        take: limit,
        skip: (page - 1) * limit,
        orderBy: {
          createdAt: sort === 'oldest' ? 'asc' : 'desc',
        },
      })
    ).map((video) => ({
      ...video,
      viewsCount: Number(video.viewsCount),
      likesCount: video.likesCount,
      dislikesCount: video.dislikesCount,
    }));
  }


  async updateChannel(userId: string, dto: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        channelName: dto.channelName,
        channelDescription: dto.channelDescription,
        channelBanner: dto.channelBanner,
      },
    });
  }

  async subscribe(viewerId: string, channelId: string) {
    if (viewerId === channelId) {
      throw new ForbiddenException("You can't subscribe to yourself");
    }

    const exists = await this.prisma.subscription.findUnique({
      where: {
        subscriberId_channelId: {
          subscriberId: viewerId,
          channelId: channelId,
        },
      },
    });

    if (exists) {
      return { message: 'Already subscribed' };
    }

    await this.prisma.subscription.create({
      data: {
        subscriberId: viewerId,
        channelId: channelId,
      },
    });

    return { message: 'Subscribed successfully' };
  }

  async unsubscribe(viewerId: string, channelId: string) {
    await this.prisma.subscription.delete({
      where: {
        subscriberId_channelId: {
          subscriberId: viewerId,
          channelId: channelId,
        },
      },
    });

    return { message: 'Unsubsciribed successfully' };
  }

  async getSubscriptions(userId: string, limit: number, page: number) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { subscriberId: userId },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        channel: true,
      },
    });

    return subscriptions.map((sub) => sub.channel);
  }

  async getSubscriptionFeed(userId: string, limit: number, page: number) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { subscriberId: userId },
      select: { channelId: true },
    });

    const channelIds = subscriptions.map((s) => s.channelId);

    return this.prisma.video.findMany({
      where: {
        authorId: { in: channelIds },
        visibility: 'PUBLIC',
        status: 'PUBLISHED',
      },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}
