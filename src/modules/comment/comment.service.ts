import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createComment(
    videoId: string,
    authorId: string,
    dto: CreateCommentDto,
  ) {
    const comment = await this.prismaService.comment.create({
      data: {
        videoId,
        authorId,
        content: dto.content,
        parentId: dto.parentId || null,
      },
      include: {
        author: true,
      },
    });

    await this.prismaService.video.update({
      where: { id: videoId },
      data: {
        commentsCount: { increment: 1 },
      },
    });

    if (dto.parentId) {
      await this.prismaService.comment.update({
        where: { id: dto.parentId },
        data: {
          likesCount: { increment: 1 },
        },
      });
    }

    return { success: true, data: comment };
  }

  async getComments(
    videoId: string,
    limit: number,
    page: number,
    sort: string,
  ) {
    const orderBy =
      sort === 'top'
        ? { likesCount: 'desc' as const }
        : { createdAt: 'desc' as const };

    const comments = await this.prismaService.comment.findMany({
      where: { videoId, parentId: null },
      take: limit,
      skip: (page - 1) * limit,
      orderBy,
      include: {
        author: true,
        replies: {
          take: 3,
          orderBy: { createdAt: 'asc' },
          include: { author: true },
        },
      },
    });

    const total = await this.prismaService.comment.count({
      where: { videoId, parentId: null },
    });

    return {
      success: true,
      data: { comments, totalComments: total, hasMore: page * limit < total },
    };
  }

  async likeComment(commentId: string, userId: string) {
    return this.prismaService.like.upsert({
      where: {
        userId_commentId_type: {
          userId,
          commentId,
          type: 'LIKE',
        },
      },
      create: {
        userId,
        commentId,
        type: 'LIKE',
      },
      update: {},
    });
  }

  async dislikeComment(commentId: string, userId: string) {
    return this.prismaService.like.upsert({
      where: {
        userId_commentId_type: {
          userId,
          commentId,
          type: 'DISLIKE',
        },
      },
      create: {
        userId,
        commentId,
        type: 'DISLIKE',
      },
      update: {},
    });
  }

  async removeLike(commentId: string, userId: string) {
    await this.prismaService.like.delete({
      where: {
        userId_commentId_type: {
          userId,
          commentId,
          type: 'LIKE',
        },
      },
    });
    return { success: true };
  }

  async pinComment(commentId: string) {
    return this.prismaService.comment.update({
      where: { id: commentId },
      data: { isPinned: true },
    });
  }
}
