import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { MovieService } from './video.service';
import path from 'path';
import { Request, Response } from 'express';

@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads',
        filename: (req, file, callback) => {
          const mimeType = path.extname(file.originalname);
          const fileName = `${Date.now()}${mimeType}`;
          callback(null, fileName);
        },
      }),
    }),
  )
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    return await this.movieService.uploadVideo(file);
  }
  @Get('watch/video/:id')
  async watchVideo(
    @Param('id') id: string,
    @Query('quality') quality: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const param = id;
    const contentRange = req.headers.range;
    console.log(contentRange);
    await this.movieService.watchVideo(
      param,
      quality,
      contentRange as string,
      res,
    );
  }
}
