import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  Req,
  Put,
  UseInterceptors,
  UseGuards,
  SetMetadata,
  UploadedFile,

  
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@Req() req: Request) {
    const userId = req['userId'];
    return await this.usersService.getProfile(userId);
  }

  @Put('me')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdateUserDto,
  ) {
    const avatarPath = file?.filename
      ? `http://${process.env.HOST}:4000/uploads/avatars/${file.filename}`
      : '';
    const userId = req['userId'];
    return await this.usersService.updateUserProfile(avatarPath, body, userId);
  }

  @Get('me/history')
  async getWatchHistory(
    @Req() req: Request,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    const userId = req['userId'];
    return await this.usersService.getWatchHistory(page, limit, userId);
  }

  @Delete('me/history')
  async deleteMyHistory(@Req() req: Request) {
    const userId = req['userId'];
    return await this.usersService.clearMyHistory(userId);
  }
}
