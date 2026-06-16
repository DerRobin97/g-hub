import { Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // stellt JwtAuthGuard bereit
  controllers: [NewsController],
  providers: [NewsService],
})
export class NewsModule {}
