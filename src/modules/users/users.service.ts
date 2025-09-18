import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async getProfile(userId: string) {
    const findUser = await this.prismaService.prisma.users.findFirst({
      where: { id: userId },
    });
    if (!findUser) throw new NotFoundException('User not found');
    const { password, ...userInfo } = findUser;
    return userInfo;
  }
  async updateUserProfile(
    avatarPath: string,
    userData: UpdateUserDto,
    id: string,
  ) {
    const findUser = await this.prismaService.prisma.users.findFirst({
      where: { id },
    });
    if (!findUser) throw new NotFoundException('User not found');
    if (userData.email) {
      const checkEmail = await this.prismaService.prisma.users.findFirst({
        where: { email: userData.email },
      });
      if (checkEmail && checkEmail.id !== findUser.id)
        throw new ConflictException('This email already existed!');
    }
    if (userData.username) {
      const checkUsername = await this.prismaService.prisma.users.findFirst({
        where: { email: userData.username },
      });
      if (checkUsername && checkUsername.id !== findUser.id)
        throw new ConflictException('This username already existed!');
    }

    const updatedUser = await this.prismaService.prisma.users.update({
      where: { id },
      data: { ...userData, avatar: avatarPath },
    });
    const { password, ...userInfo } = updatedUser;
    return userInfo;
  }

  async getWatchHistory(page: number, limit: number, id: string) {
    if (!id) throw new BadRequestException('User ID is required');
    const parsedLimit = Number(limit) || 10;
    const parsedPage = Number(page) || 1;
    const findUser = await this.prismaService.prisma.users.findFirst({
      where: { id },
    });
    if (!findUser) throw new NotFoundException('User not found');
    const offset = (parsedPage - 1) * parsedLimit;
    const history = await this.prismaService.prisma.watchHistory.findMany({
      where: { userId: id },
      include: {
        video: {
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
        },
      },
      orderBy: {
        watchedAt: 'desc',
      },
      skip: offset,
      take: parsedLimit,
    });
    const totalHistory = await this.prismaService.prisma.watchHistory.count({
      where: { userId: id },
    });
    const totalPages = Math.ceil(totalHistory / parsedLimit);

    return {
      history,
      pagination: {
        currentPage: parsedPage,
        totalPages,
        totalHistory,
        limit: parsedLimit,
        hasNextPage: parsedPage < totalPages,
        hasPreviousPage: parsedPage > 1,
      },
    };
  }

  async clearMyHistory(id: string) {
    await this.prismaService.prisma.watchHistory.deleteMany({
      where: { userId: id },
    });
    return { message: 'History successful cleared' };
  }
}
