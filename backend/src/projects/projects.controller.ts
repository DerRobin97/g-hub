import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import type {
  ProjectDetailDto,
  ProjectMemberDto,
  ProjectSummaryDto,
  ProjectTaskDto,
} from '@g-hub/shared';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { CreatePhaseDto, UpdatePhaseDto } from './dto/phase.dto';
import { CreateProjectTaskDto, UpdateProjectTaskDto } from './dto/project-task.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/jwt-payload.interface';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser): Promise<ProjectSummaryDto[]> {
    return this.projects.list(user.id);
  }

  // Vor ':id' deklarieren, damit /projects/members nicht als ID interpretiert wird.
  @Get('members')
  members(@CurrentUser() user: AuthenticatedUser): Promise<ProjectMemberDto[]> {
    return this.projects.listMembers(user.id);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string): Promise<ProjectDetailDto> {
    return this.projects.get(user.id, id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateProjectDto,
  ): Promise<ProjectDetailDto> {
    return this.projects.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ): Promise<ProjectDetailDto> {
    return this.projects.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<{ status: string }> {
    return this.projects.remove(user.id, id);
  }

  @Post(':id/phases')
  createPhase(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: CreatePhaseDto,
  ): Promise<ProjectDetailDto> {
    return this.projects.createPhase(user.id, id, dto);
  }
}

@Controller('phases')
@UseGuards(JwtAuthGuard)
export class PhasesController {
  constructor(private readonly projects: ProjectsService) {}

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdatePhaseDto,
  ): Promise<ProjectDetailDto> {
    return this.projects.updatePhase(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ProjectDetailDto> {
    return this.projects.removePhase(user.id, id);
  }

  @Post(':id/tasks')
  createTask(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: CreateProjectTaskDto,
  ): Promise<ProjectTaskDto> {
    return this.projects.createTask(user.id, id, dto);
  }
}

@Controller('project-tasks')
@UseGuards(JwtAuthGuard)
export class ProjectTasksController {
  constructor(private readonly projects: ProjectsService) {}

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateProjectTaskDto,
  ): Promise<ProjectTaskDto> {
    return this.projects.updateTask(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<{ status: string }> {
    return this.projects.removeTask(user.id, id);
  }
}
