import {
  Controller,
  Get,
  Param,
  Request,
  Put,
  Body,
  UseGuards,
  Post,
  Delete,
  Query,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { UpdateChannelDto } from './dto/update-channel.dto';

@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Get('/:username')
  async getChannel(@Param('username') username: string) {
    // console.log(username);
    return this.channelService.getChannelInfo(username);
  }

  @Get(':username/videos')
  async getChannelVideos(
    @Param('username') username: string,
    @Query('limit') limit = 20,
    @Query('page') page = 1,
    @Query('sort') sort = 'newest',
  ) {
    
    return this.channelService.getChannelVideos(username, +limit, +page, sort);
  }

  @UseGuards(AuthGuard)
  @Put('me')
  async updateChannel(@Request() req, @Body() dto: UpdateChannelDto) {
    return this.channelService.updateChannel(req.user?.id, dto);
  }

  @UseGuards(AuthGuard)
  @Post(':userId/subscribe')
  async subscribe(@Request() req, @Param('userId') userId: string) {
    return this.channelService.subscribe(req.user?.id, userId);
  }

  @UseGuards(AuthGuard)
  @Delete(':userId/subscribe')
  async unsubscribe(@Request() req, @Param('userId') userId: string) {
    return this.channelService.unsubscribe(req.user?.id, userId);
  }

  @UseGuards(AuthGuard)
  @Get('subscriptions')
  async getSubscriptions(
    @Request() req,
    @Query('limit') limit = 20,
    @Query('page') page = 1,
  ) {
    return this.channelService.getSubscriptions(req.user?.id, +limit, +page);
  }

  @UseGuards(AuthGuard)
  @Get('subscriptions/feed')
  async getSubscriptionFeed(
    @Request() req,
    @Query('limit') limit = 20,
    @Query('page') page = 1,
  ) {
    return this.channelService.getSubscriptionFeed(req.user?.id, +limit, +page);
  }
}
