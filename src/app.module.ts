import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { CoreModule } from './core/core.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import TransformInterceoptor from './common/interceptors/transform.interceptor';
import { AuthGuard } from './common/guards/auth.guard';
import { ChannelModule } from './modules/channel/channel.module';
import { VideoModule } from './modules/video/video.module';
import { CommentsModule } from './modules/comments/comments.module';
import { PlaylistModule } from './modules/playlist/playlist.module';
import { AdminModule } from './modules/admin/admin.module';
import { CategoryModule } from './modules/category/category.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    // OAuthModule,
    CoreModule,
    ChannelModule,
    VideoModule,
    CommentsModule,
    PlaylistModule,
    AdminModule,
    CategoryModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceoptor,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
