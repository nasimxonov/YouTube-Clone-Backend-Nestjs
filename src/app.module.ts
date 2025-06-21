import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DatabaseModule } from './core/database/database.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './common/interceptors/transform.intercptors';
import { VideoModule } from './modules/video/video.module';
import { CoreModule } from './core/core.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ChannelModule } from './modules/channel/channel.module';
import { CommentModule } from './modules/comment/comment.module';
import { PlaylistModule } from './modules/playlist/playlist.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
    }),
    AuthModule,
    UsersModule,
    DatabaseModule,
    VideoModule,
    AnalyticsModule,
    CoreModule,
    ChannelModule,
    CommentModule,
    PlaylistModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
