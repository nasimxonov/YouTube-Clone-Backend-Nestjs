import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class ChannelService {
  constructor(private db: PrismaService) {}
  async updateChannel(
    banner: string,
    channelData: UpdateChannelDto,
    id: string,
  ) {
    const findChannel = await this.db.prisma.users.findFirst({ where: { id } });
    if (!findChannel) throw new NotFoundException('channel not found');
    const updatedChannel = await this.db.prisma.users.update({
      where: { id },
      data: { ...channelData, channelBanner: banner },
    });
    const { password, ...channelInfo } = updatedChannel;
    return channelInfo;
  }

  async getChannel(username: string, id: string) {
    const findChannel = await this.db.prisma.users.findFirst({
      where: { username },
      select: {
        id: true,
        username: true,
        channelName: true,
        channelDescription: true,
        avatar: true,
        channelBanner: true,
        subscribersCount: true,
        totalViews: true,
      },
    });
    if (!findChannel) throw new NotFoundException('Channel not found');
    const videosCount = await this.db.prisma.video.aggregate({
      where: { authorId: findChannel.id },
      _count: true,
    });
    const checkSubscription = await this.db.prisma.subscription.findFirst({
      where: { channelId: findChannel.id, subscriberId: id },
    });
    return {
      ...findChannel,
      videosCount: videosCount._count,
      joindedAt: checkSubscription?.createdAt,
      isSubscribed: checkSubscription ? true : false,
    };
  }

  async subscribe(userId: string, channelId: string, notification: boolean) {
    const findChannel = await this.db.prisma.users.findFirst({
      where: { id: channelId },
    });
    if (!findChannel) throw new NotFoundException('Channel not found');
    const checkSubscription = await this.db.prisma.subscription.findFirst({
      where: { channelId, subscriberId: userId },
    });
    if (checkSubscription)
      throw new ConflictException('you already followed this channel');
    await this.db.prisma.subscription.create({
      data: {
        subscriberId: userId,
        channelId,
        notificationsEnabled: notification,
      },
    });
    await this.db.prisma.users.update({
      where: { id: userId },
      data: { subscribersCount: { increment: 1 } },
    });
  }

  async unsubscribe(userId: string, channelId: string) {
    const checkSubscription = await this.db.prisma.subscription.findFirst({
      where: { channelId, subscriberId: userId },
    });
    if (!checkSubscription) new NotFoundException('subscription not found');
    await this.db.prisma.subscription.delete({
      where: { id: checkSubscription?.id },
    });
    await this.db.prisma.users.update({
      where: { id: userId },
      data: { subscribersCount: { decrement: 1 } },
    });
  }

  async getSubscription(id: string, limit: number, page: number) {
    const findChannel = await this.db.prisma.users.findFirst({ where: { id } });
    if (!findChannel) throw new NotFoundException('Channel not found');
    const [subscriptions, totalCount] = await Promise.all([
      this.db.prisma.subscription.findMany({
        where: { channelId: id },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          channel: {
            select: {
              id: true,
              username: true,
              avatar: true,
              channelBanner: true,
              firstName: true,
              lastName: true,
            },
          },
          subscriber: {
            select: {
              id: true,
              username: true,
              avatar: true,
              channelBanner: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.db.prisma.subscription.count({
        where: { channelId: id },
      }),
    ]);

    return {
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      subscriptions,
    };
  }

  async getSubscriptionFeed(id: string, limit: number, page: number) {
    const findChannel = await this.db.prisma.users.findFirst({ where: { id } });
    if (!findChannel) throw new NotFoundException('Channel not found am');
    const [subscriptions, totalCount] = await Promise.all([
      this.db.prisma.subscription.findMany({
        where: { subscriberId: id },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          channel: {
            select: {
              id: true,
              username: true,
              avatar: true,
              channelBanner: true,
              firstName: true,
              lastName: true,
            },
          },
          subscriber: {
            select: {
              id: true,
              username: true,
              avatar: true,
              channelBanner: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.db.prisma.subscription.count({
        where: { subscriberId: id },
      }),
    ]);

    return {
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      subscriptions,
    };
  }
}
