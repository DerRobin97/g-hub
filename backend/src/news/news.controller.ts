import { Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import type { NewsDto } from '@g-hub/shared';
import { NewsService } from './news.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/jwt-payload.interface';

@Controller('news')
@UseGuards(JwtAuthGuard)
export class NewsController {
  constructor(private readonly news: NewsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser): Promise<NewsDto[]> {
    return this.news.list(user.id);
  }

  @Post('read-all')
  markAllRead(@CurrentUser() user: AuthenticatedUser): Promise<{ status: string }> {
    return this.news.markAllRead(user.id);
  }

  @Patch(':id/read')
  markRead(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string): Promise<NewsDto> {
    return this.news.markRead(user.id, id);
  }
}
