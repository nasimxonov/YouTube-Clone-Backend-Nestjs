import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import VideoConvertService from './video_convert.service';
import { diskStorage } from 'multer';
import * as path from 'path';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
          cb(null, uniqueName);
        },
      }),
    }),
    JwtModule,
  ],
  controllers: [VideoController],
  providers: [VideoService, VideoConvertService],
})
export class VideoModule {}
