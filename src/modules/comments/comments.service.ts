import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly db: PrismaService) {}

  async createComment(userId: string, content: string, videoId: string) {
    const findVideo = await this.db.prisma.video.findFirst({
      where: { id: videoId },
    });
    if (!findVideo) throw new NotFoundException('Video not found');
    const findUser = await this.db.prisma.users.findFirst({
      where: { id: userId },
    });

    if (!findUser) throw new NotFoundException('User not found');
    const comment = await this.db.prisma.comment.create({
      data: { content, authorId: userId, videoId },
      include: {
        author: {
          select: { id: true, username: true, channelName: true, avatar: true },
        },
      },
    });
    return { message: 'comment successful created', data: comment };
  }

  async getComments(videoId: string, limit: number, page: number) {
    const findVideo = await this.db.prisma.video.findFirst({
      where: { id: videoId },
    });
    if (!findVideo) throw new NotFoundException('Video not Found');
    const offset = (page - 1) * limit;
    const comments = await this.db.prisma.comment.findMany({
      where: {
        videoId: videoId,
      },
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
    const totalComments = await this.db.prisma.comment.count({
      where: {
        videoId: videoId,
      },
    });
    const totalPages = Math.ceil(totalComments / limit);

    return {
      comments,
      pagination: {
        currentPage: page,
        totalPages,
        totalComments,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async likeComment(id: string, userId: string) {
    const findComment = await this.db.prisma.comment.findFirst({
      where: { id },
    });
    if (!findComment) throw new NotFoundException('Comment not found');
    const result = await this.db.prisma.like.create({
      data: { type: 'LIKE', commentId: id, userId },
    });
    await this.db.prisma.comment.update({
      where: { id },
      data: { likesCount: { increment: 1 } },
    });
    return result;
  }

  async dislikeComment(id: string, userId: string) {
    const findComment = await this.db.prisma.comment.findFirst({
      where: { id },
    });
    if (!findComment) throw new NotFoundException('Comment not found');
    const result = await this.db.prisma.like.create({
      data: { type: 'DISLIKE', commentId: id, userId },
    });
    return result;
  }

  async deleteLike(id: string) {
    const findLike = await this.db.prisma.like.findFirst({ where: { id } });
    if (!findLike) throw new NotFoundException('Like not found');
    if (findLike.type === 'LIKE') {
      await this.db.prisma.comment.update({
        where: { id },
        data: { likesCount: { decrement: 1 } },
      });
    }
    await this.db.prisma.like.delete({ where: { id } });
    return { message: 'Like successful deleted' };
  }

  async pinUnpinComment(id: string, userId: string, data: UpdateCommentDto) {
    const findComment = await this.db.prisma.comment.findFirst({
      where: { id },
    });
    if (!findComment) throw new NotFoundException('Comment not found');
    const findVideo = await this.db.prisma.video.findFirst({
      where: { id: findComment.videoId },
    });
    if (!findVideo) throw new NotFoundException('Video not found');
    if (userId !== findVideo.authorId)
      throw new ForbiddenException('Only author of video can pin comment');
    await this.db.prisma.comment.update({ where: { id }, data });
    return { message: 'success', data };
  }
}
