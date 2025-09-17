import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  Query,
  InternalServerErrorException,
  Put,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Request } from 'express';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':videoid/video')
  async createComment(
    @Param('videoid') videoId: string,
    @Body() body: CreateCommentDto,
    @Req() req: Request,
  ) {
    const userId = req['userId'];
    return await this.commentsService.createComment(
      userId,
      body.content,
      videoId,
    );
  }

  @Get(':videoid')
  async getComments(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Param(':videoid') videoId: string,
  ) {
    try {
      return await this.commentsService.getComments(videoId, limit, page);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @Post(':id/like')
  async likeComment(@Param('id') id: string, @Req() req: Request) {
    const userId = req['userId'];
    return await this.commentsService.likeComment(id, userId);
  }

  @Post(':id/dislike')
  async dislikeComment(@Param('id') id: string, @Req() req: Request) {
    const userId = req['userId'];
    return await this.commentsService.dislikeComment(id, userId);
  }

  @Delete(':id/like')
  async deleteLike(@Param('id') id: string) {
    return await this.commentsService.deleteLike(id);
  }

  @Put(':id/pin')
  async pinUnpinComment(
    @Param('id') id: string,
    @Body() body: UpdateCommentDto,
    @Req() req: Request,
  ) {
    const userId = req['userId'];
    return await this.commentsService.pinUnpinComment(id, userId, body);
  }
}
