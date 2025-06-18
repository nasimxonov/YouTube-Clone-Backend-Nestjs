import { PartialType } from '@nestjs/mapped-types';
import { CreateMovieDto as CreateVideoDto } from './create-video.dto';

export class UpdateVideoDto extends PartialType(CreateVideoDto) {}
