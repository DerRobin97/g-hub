import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { MeModule } from './me/me.module';
import { TasksModule } from './tasks/tasks.module';
import { ProjectsModule } from './projects/projects.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { PlanModule } from './plan/plan.module';
import { TimeTrackingModule } from './time-tracking/time-tracking.module';
import { AssetsModule } from './assets/assets.module';
import { SearchModule } from './search/search.module';
import { NewsModule } from './news/news.module';
import { AiModule } from './ai/ai.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DemoModule } from './demo/demo.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../.env'] }),
    PrismaModule,
    HealthModule,
    AuthModule,
    MeModule,
    TasksModule,
    ProjectsModule,
    CampaignsModule,
    PlanModule,
    TimeTrackingModule,
    AssetsModule,
    SearchModule,
    NewsModule,
    AiModule,
    NotificationsModule,
    DemoModule,
  ],
})
export class AppModule {}
