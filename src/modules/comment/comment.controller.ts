import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('videos/:id/comments')
export class CommentController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createComment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.commentsService.createComment(id, userId, dto);
  }

  @Get()
  async getComments(
    @Param('id') id: string,
    @Query('limit') limit: string,
    @Query('page') page: string,
    @Query('sort') sort: string,
  ) {
    return this.commentsService.getComments(
      id,
      Number(limit) || 20,
      Number(page) || 1,
      sort || 'new',
    );
  }
}

@Controller('comments')
export class CommentActionsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(AuthGuard)
  @Post(':id/like')
  async likeComment(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.commentsService.likeComment(id, userId);
  }

  @UseGuards(AuthGuard)
  @Post(':id/dislike')
  async dislikeComment(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.commentsService.dislikeComment(id, userId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id/like')
  async removeLike(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.commentsService.removeLike(id, userId);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/pin')
  async pinComment(@Param('id') id: string) {
    return this.commentsService.pinComment(id);
  }
}
