import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Query,
  UseGuards,
  Request,
  SetMetadata,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RoleGuard } from 'src/common/guard/role.guard';

@UseGuards(AuthGuard, RoleGuard)
@SetMetadata('roles', ['USER'])
@Controller('videos')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post(':id/view')
  async recordView(
    @Param('id') videoId: string,
    @Body()
    body: {
      watchTime: number;
      quality: string;
      device: string;
      location: string;
    },
    @Request() req,
  ) {
    const userId = req.user?.id || null;
    return this.analyticsService.recordView(videoId, userId, body);
  }

  @Get(':id/analytics')
  async getAnalytics(
    @Param('id') videoId: string,
    @Query('timeframe') timeframe: string,
    @Request() req,
  ) {
    return this.analyticsService.getAnalytics(videoId, req.user.id, timeframe);
  }
}
