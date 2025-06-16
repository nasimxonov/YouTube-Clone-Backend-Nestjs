import { Module } from '@nestjs/common';
import { MovieService } from './video.service';
import { MovieController } from './video.controller';

@Module({
  controllers: [MovieController],
  providers: [MovieService],
})
export class MovieModule {}
