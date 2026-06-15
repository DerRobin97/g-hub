import { Module } from '@nestjs/common';
import {
  PhasesController,
  ProjectTasksController,
  ProjectsController,
} from './projects.controller';
import { ProjectsService } from './projects.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // stellt JwtAuthGuard bereit
  controllers: [ProjectsController, PhasesController, ProjectTasksController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
