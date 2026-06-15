import { Module } from '@nestjs/common';
import { TimeTrackingController } from './time-tracking.controller';
import { TimeTrackingService } from './time-tracking.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // stellt JwtAuthGuard bereit
  controllers: [TimeTrackingController],
  providers: [TimeTrackingService],
})
export class TimeTrackingModule {}
