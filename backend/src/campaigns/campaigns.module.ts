import { Module } from '@nestjs/common';
import {
  CampaignsController,
  DiscountsController,
  MeasuresController,
} from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // stellt JwtAuthGuard bereit
  controllers: [CampaignsController, MeasuresController, DiscountsController],
  providers: [CampaignsService],
})
export class CampaignsModule {}
