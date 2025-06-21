import { Module } from '@nestjs/common';
import { CommentsService } from './comment.service';
import {
  CommentController,
  CommentActionsController,
} from './comment.controller';
@Module({
  controllers: [CommentController, CommentActionsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentModule {}
