import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseInterceptors,
  UploadedFile,
  Req,
  SetMetadata,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { SubscribeDto } from './dto/subscribe-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { RoleGuard } from 'src/common/guards/role.guard';

@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Put('me')
  @UseInterceptors(FileInterceptor('banner'))
  async updateChannel(
    @Body() body: UpdateChannelDto,
    @UploadedFile() banner: Express.Multer.File,
    @Req() req: Request,
  ) {
    const id = req['userId'];
    console.log(banner);
    const bannerUrl = banner?.filename
      ? `http://${process.env.HOST}:${process.env.PORT}/uploads/banners/${banner.filename}`
      : '';
    console.log(bannerUrl);
    return await this.channelService.updateChannel(bannerUrl, body, id);
  }

  @Get(':username')
  async getChannelInfo(
    @Param('username') username: string,
    @Req() req: Request,
  ) {
    const id = req['userId'];
    return await this.channelService.getChannel(username, id);
  }

  @Post(':userid/subscribe')
  async subscribe(
    @Req() req: Request,
    @Param('userid') id: string,
    @Body() body: SubscribeDto,
  ) {
    const userId = req['userId'];
    return await this.channelService.subscribe(
      userId,
      id,
      body.notificationEnabled,
    );
  }

  @Delete(':userid/unsubscribe')
  async unsubscribe(@Req() req: Request, @Param('userid') channelId: string) {
    const userId = req['userId'];
    return await this.channelService.unsubscribe(userId, channelId);
  }

  @Get('feed/subscription')
  async getFeedSubscription(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: Request,
  ) {
    const userId = req['userId'];
    console.log('kelyabdi', userId);

    return await this.channelService.getSubscriptionFeed(userId, limit, page);
  }

  @Get()
  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['SUPERADMIN', 'ADMIN', 'OWNER'])
  async getSubscription(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: Request,
  ) {
    const userId = req['userId'];
    console.log(userId);

    return await this.channelService.getSubscription(userId, limit, page);
  }
}
