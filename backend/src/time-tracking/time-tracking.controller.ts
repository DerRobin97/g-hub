import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import type { TimeEntryDto, TimeOverviewDto } from '@g-hub/shared';
import { TimeTrackingService } from './time-tracking.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/jwt-payload.interface';

@Controller('time')
@UseGuards(JwtAuthGuard)
export class TimeTrackingController {
  constructor(private readonly time: TimeTrackingService) {}

  @Get('today')
  today(@CurrentUser() user: AuthenticatedUser): Promise<TimeEntryDto | null> {
    return this.time.today(user.id);
  }

  @Get('month')
  month(@CurrentUser() user: AuthenticatedUser): Promise<TimeOverviewDto> {
    return this.time.overview(user.id);
  }

  @Post('clock-in')
  clockIn(@CurrentUser() user: AuthenticatedUser): Promise<TimeEntryDto> {
    return this.time.clockIn(user.id);
  }

  @Post('clock-out')
  clockOut(@CurrentUser() user: AuthenticatedUser): Promise<TimeEntryDto> {
    return this.time.clockOut(user.id);
  }

  @Post('break/start')
  startBreak(@CurrentUser() user: AuthenticatedUser): Promise<TimeEntryDto> {
    return this.time.startBreak(user.id);
  }

  @Post('break/end')
  endBreak(@CurrentUser() user: AuthenticatedUser): Promise<TimeEntryDto> {
    return this.time.endBreak(user.id);
  }
}
