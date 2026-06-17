import { Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import type { NotificationDto } from '@g-hub/shared';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/jwt-payload.interface';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser): Promise<NotificationDto[]> {
    return this.notifications.list(user.id);
  }

  @Post('read-all')
  markAllRead(@CurrentUser() user: AuthenticatedUser): Promise<{ status: string }> {
    return this.notifications.markAllRead(user.id);
  }

  @Patch(':id/read')
  markRead(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string): Promise<NotificationDto> {
    return this.notifications.markRead(user.id, id);
  }
}
