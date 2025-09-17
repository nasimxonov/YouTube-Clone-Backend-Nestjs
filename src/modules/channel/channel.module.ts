import { Module, UnsupportedMediaTypeException } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path from 'path';
import { v4 as uuid } from 'uuid';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads/banners',
      storage: diskStorage({
        filename: (req, file, callback) => {
          const extName = path.extname(file.originalname);
          const fileName = `${uuid()}${extName}`;
          callback(null, fileName);
        },
        destination: './uploads/banners',
      }),

      fileFilter: (req, file, callback) => {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowed.includes(file.mimetype)) {
          return callback(
            new UnsupportedMediaTypeException(
              'Only .jpg, .jpeg, .png image types are allowed!',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  ],
  controllers: [ChannelController],
  providers: [ChannelService],
})
export class ChannelModule {}
