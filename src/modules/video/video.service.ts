import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import VideoService from './video_convert.service';
@Injectable()
export class MovieService {
  constructor(private videoService: VideoService) {}
  async uploadVideo(file: Express.Multer.File) {
    const fileName = file.filename;
    const videoPath = path.join(process.cwd(), 'uploads', fileName);
    const resolution: any =
      await this.videoService.getVideoResolution(videoPath);
    const resolutions = [
      { height: 240 },
      { height: 360 },
      { height: 480 },
      { height: 720 },
      { height: 1080 },
    ];

    const validResolutions = resolutions.filter(
      (r) => r.height <= resolution.height + 6,
    );

    if (validResolutions.length > 0) {
      fs.mkdir(
        path.join(process.cwd(), 'uploads', 'videos', fileName.split('.')[0]),
        {
          recursive: true,
        },
        (err) => {
          if (err) throw new InternalServerErrorException(err);
        },
      );
      await Promise.all(
        this.videoService.convertToResolutions(
          videoPath,
          path.join(process.cwd(), 'uploads', 'videos', fileName.split('.')[0]),
          validResolutions,
        ),
      );
      fs.unlinkSync(videoPath);
      return {
        message: 'success',
      };
    } else {
      console.log('❗ Video juda past sifatli, convert qilish kerak emas.');
    }
  }
  async watchVideo(id: string, quality: string, range: string, res: Response) {
    const fileName = id;
    const baseQuality = `${quality}.mp4`;
    const basePath = path.join(process.cwd(), 'uploads', 'videos');
    const readDir = fs.readdirSync(basePath);
    const videoActivePath = path.join(basePath, fileName, baseQuality);
    if (!readDir.includes(fileName))
      throw new NotFoundException('video not found');
    const innerVideoDir = fs.readdirSync(path.join(basePath, fileName));
    if (!innerVideoDir.includes(baseQuality))
      throw new NotFoundException('video quality not found');
    const { size } = fs.statSync(videoActivePath);
    const { start, end } = this.videoService.getChunkProps(range, size);
    if (!range) {
      res.writeHead(200, {
        'Content-Type': 'video/mp4',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      });
      const videoStream = fs.createReadStream(videoActivePath, {
        start,
        end,
        highWaterMark: 10 * 1024,
      });
      videoStream.pipe(res);
    } else {
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Accept-Ranges': 'bytes',
        'Content-Type': 'video/mp4',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      });
      const videoStream = fs.createReadStream(videoActivePath, {
        start,
        end,
      });
      videoStream.pipe(res);
    }
  }
}
