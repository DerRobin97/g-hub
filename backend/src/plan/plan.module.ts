import { Module } from '@nestjs/common';
import { PlanController, PlanLinksController, PlanThemesController } from './plan.controller';
import { PlanService } from './plan.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // stellt JwtAuthGuard bereit
  controllers: [PlanController, PlanThemesController, PlanLinksController],
  providers: [PlanService],
})
export class PlanModule {}
