import { IsBoolean } from 'class-validator';

export class UpdateCommentDto {
  @IsBoolean()
  isPinned: boolean;
}
