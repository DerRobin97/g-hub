import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type {
  PhaseDto,
  ProjectDetailDto,
  ProjectMemberDto,
  ProjectSummaryDto,
  ProjectTaskDto,
} from '@g-hub/shared';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import type { CreatePhaseDto, UpdatePhaseDto } from './dto/phase.dto';
import type { CreateProjectTaskDto, UpdateProjectTaskDto } from './dto/project-task.dto';

const MEMBER_USER = { include: { user: true } } as const;

const DETAIL_INCLUDE = {
  lead: true,
  members: MEMBER_USER,
  phases: {
    orderBy: { order: 'asc' },
    include: {
      tasks: {
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        include: { members: MEMBER_USER },
      },
    },
  },
} satisfies Prisma.ProjectInclude;

const LIST_INCLUDE = {
  lead: true,
  members: MEMBER_USER,
  phases: { include: { tasks: { select: { done: true } } } },
} satisfies Prisma.ProjectInclude;

type ProjectDetail = Prisma.ProjectGetPayload<{ include: typeof DETAIL_INCLUDE }>;
type ProjectList = Prisma.ProjectGetPayload<{ include: typeof LIST_INCLUDE }>;
type TaskWithMembers = Prisma.ProjectTaskGetPayload<{ include: { members: typeof MEMBER_USER } }>;
type UserLite = { id: string; name: string; avatarUrl: string | null };

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Workspace-Mitglieder (für Picker) ──────────────────────
  async listMembers(userId: string): Promise<ProjectMemberDto[]> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const members = await this.prisma.membership.findMany({
      where: { workspaceId },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });
    return members.map((m) => this.memberDto(m.user));
  }

  // ── Projekte ───────────────────────────────────────────────
  async list(userId: string): Promise<ProjectSummaryDto[]> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const projects = await this.prisma.project.findMany({
      where: { workspaceId },
      include: LIST_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return projects.map((p) => this.summaryDto(p));
  }

  async get(userId: string, id: string): Promise<ProjectDetailDto> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const project = await this.prisma.project.findFirst({
      where: { id, workspaceId },
      include: DETAIL_INCLUDE,
    });
    if (!project) throw new NotFoundException('Projekt nicht gefunden.');
    return this.detailDto(project);
  }

  async create(userId: string, dto: CreateProjectDto): Promise<ProjectDetailDto> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const memberIds = await this.resolveMembers(workspaceId, dto.memberIds, userId);
    const leadId = dto.leadId && memberIds.includes(dto.leadId) ? dto.leadId : userId;

    const project = await this.prisma.project.create({
      data: {
        workspaceId,
        createdById: userId,
        leadId,
        name: dto.name,
        kind: dto.kind ?? null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        dueLabel: dto.dueLabel ?? null,
        budgetText: dto.budgetText ?? null,
        description: dto.description ?? null,
        members: { create: memberIds.map((uid) => ({ userId: uid })) },
      },
      include: DETAIL_INCLUDE,
    });
    return this.detailDto(project);
  }

  async update(userId: string, id: string, dto: UpdateProjectDto): Promise<ProjectDetailDto> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const existing = await this.prisma.project.findFirst({ where: { id, workspaceId } });
    if (!existing) throw new NotFoundException('Projekt nicht gefunden.');

    const data: Prisma.ProjectUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.kind !== undefined) data.kind = dto.kind;
    if (dto.dueDate !== undefined) data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    if (dto.dueLabel !== undefined) data.dueLabel = dto.dueLabel;
    if (dto.budgetText !== undefined) data.budgetText = dto.budgetText;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.leadId !== undefined) {
      data.lead = dto.leadId ? { connect: { id: dto.leadId } } : { disconnect: true };
    }
    if (dto.memberIds !== undefined) {
      const ids = await this.resolveMembers(workspaceId, dto.memberIds, userId);
      data.members = { deleteMany: {}, create: ids.map((uid) => ({ userId: uid })) };
    }

    const project = await this.prisma.project.update({
      where: { id },
      data,
      include: DETAIL_INCLUDE,
    });
    return this.detailDto(project);
  }

  async remove(userId: string, id: string): Promise<{ status: string }> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const existing = await this.prisma.project.findFirst({ where: { id, workspaceId } });
    if (!existing) throw new NotFoundException('Projekt nicht gefunden.');
    await this.prisma.project.delete({ where: { id } });
    return { status: 'ok' };
  }

  // ── Phasen ─────────────────────────────────────────────────
  async createPhase(userId: string, projectId: string, dto: CreatePhaseDto): Promise<ProjectDetailDto> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const project = await this.prisma.project.findFirst({ where: { id: projectId, workspaceId } });
    if (!project) throw new NotFoundException('Projekt nicht gefunden.');
    const order = dto.order ?? (await this.prisma.phase.count({ where: { projectId } }));
    await this.prisma.phase.create({ data: { projectId, name: dto.name, order } });
    return this.get(userId, projectId);
  }

  async updatePhase(userId: string, phaseId: string, dto: UpdatePhaseDto): Promise<ProjectDetailDto> {
    const phase = await this.ensurePhase(userId, phaseId);
    await this.prisma.phase.update({
      where: { id: phaseId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.order !== undefined ? { order: dto.order } : {}),
      },
    });
    return this.get(userId, phase.projectId);
  }

  async removePhase(userId: string, phaseId: string): Promise<ProjectDetailDto> {
    const phase = await this.ensurePhase(userId, phaseId);
    await this.prisma.phase.delete({ where: { id: phaseId } });
    return this.get(userId, phase.projectId);
  }

  // ── Projekt-Aufgaben ───────────────────────────────────────
  async createTask(
    userId: string,
    phaseId: string,
    dto: CreateProjectTaskDto,
  ): Promise<ProjectTaskDto> {
    const phase = await this.ensurePhase(userId, phaseId);
    const workspaceId = await this.resolveWorkspaceId(userId);
    const memberIds = await this.resolveMembers(workspaceId, dto.memberIds);
    const count = await this.prisma.projectTask.count({ where: { phaseId } });

    const task = await this.prisma.projectTask.create({
      data: {
        phaseId: phase.id,
        title: dto.title,
        description: dto.description ?? null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        dueLabel: dto.dueLabel ?? null,
        priority: dto.priority ?? 'mid',
        links: dto.links ?? [],
        order: count,
        members: { create: memberIds.map((uid) => ({ userId: uid })) },
      },
      include: { members: MEMBER_USER },
    });
    return this.taskDto(task);
  }

  async updateTask(userId: string, taskId: string, dto: UpdateProjectTaskDto): Promise<ProjectTaskDto> {
    const existing = await this.ensureTask(userId, taskId);
    const workspaceId = await this.resolveWorkspaceId(userId);

    const data: Prisma.ProjectTaskUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.dueDate !== undefined) data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    if (dto.dueLabel !== undefined) data.dueLabel = dto.dueLabel;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.links !== undefined) data.links = dto.links;
    if (dto.done !== undefined) {
      data.done = dto.done;
      data.completedAt = dto.done ? new Date() : null;
    }
    if (dto.memberIds !== undefined) {
      const ids = await this.resolveMembers(workspaceId, dto.memberIds);
      data.members = { deleteMany: {}, create: ids.map((uid) => ({ userId: uid })) };
    }

    const task = await this.prisma.projectTask.update({
      where: { id: existing.id },
      data,
      include: { members: MEMBER_USER },
    });
    return this.taskDto(task);
  }

  async removeTask(userId: string, taskId: string): Promise<{ status: string }> {
    const existing = await this.ensureTask(userId, taskId);
    await this.prisma.projectTask.delete({ where: { id: existing.id } });
    return { status: 'ok' };
  }

  // ── Helfer ─────────────────────────────────────────────────
  private async resolveWorkspaceId(userId: string): Promise<string> {
    const membership = await this.prisma.membership.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    if (!membership) throw new ForbiddenException('Kein Workspace für diesen Nutzer.');
    return membership.workspaceId;
  }

  private async ensurePhase(userId: string, phaseId: string): Promise<{ id: string; projectId: string }> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const phase = await this.prisma.phase.findFirst({
      where: { id: phaseId, project: { workspaceId } },
      select: { id: true, projectId: true },
    });
    if (!phase) throw new NotFoundException('Phase nicht gefunden.');
    return phase;
  }

  private async ensureTask(userId: string, taskId: string): Promise<{ id: string }> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const task = await this.prisma.projectTask.findFirst({
      where: { id: taskId, phase: { project: { workspaceId } } },
      select: { id: true },
    });
    if (!task) throw new NotFoundException('Aufgabe nicht gefunden.');
    return task;
  }

  /** Beschränkt IDs auf Workspace-Mitglieder; optional `fallback` immer enthalten. */
  private async resolveMembers(
    workspaceId: string,
    requested: string[] | undefined,
    fallback?: string,
  ): Promise<string[]> {
    const base = requested ?? [];
    if (fallback) base.push(fallback);
    if (base.length === 0) return [];
    const members = await this.prisma.membership.findMany({
      where: { workspaceId, userId: { in: base } },
      select: { userId: true },
    });
    const allowed = members.map((m) => m.userId);
    const result = Array.from(new Set(allowed));
    return result.length > 0 || !fallback ? result : [fallback];
  }

  // ── Mapper ─────────────────────────────────────────────────
  private memberDto(user: UserLite): ProjectMemberDto {
    return { userId: user.id, name: user.name, avatarUrl: user.avatarUrl };
  }

  private taskDto(task: TaskWithMembers): ProjectTaskDto {
    return {
      id: task.id,
      phaseId: task.phaseId,
      title: task.title,
      description: task.description,
      done: task.done,
      completedAt: task.completedAt ? task.completedAt.toISOString() : null,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      dueLabel: task.dueLabel,
      priority: task.priority,
      links: task.links,
      order: task.order,
      members: task.members.map((m) => this.memberDto(m.user)),
    };
  }

  private phaseDto(phase: ProjectDetail['phases'][number]): PhaseDto {
    return {
      id: phase.id,
      name: phase.name,
      order: phase.order,
      tasks: phase.tasks.map((t) => this.taskDto(t)),
    };
  }

  private summaryDto(project: ProjectList): ProjectSummaryDto {
    const tasks = project.phases.flatMap((ph) => ph.tasks);
    return {
      id: project.id,
      name: project.name,
      kind: project.kind,
      dueDate: project.dueDate ? project.dueDate.toISOString() : null,
      dueLabel: project.dueLabel,
      budgetText: project.budgetText,
      lead: project.lead ? this.memberDto(project.lead) : null,
      members: project.members.map((m) => this.memberDto(m.user)),
      taskCount: tasks.length,
      doneCount: tasks.filter((t) => t.done).length,
    };
  }

  private detailDto(project: ProjectDetail): ProjectDetailDto {
    const tasks = project.phases.flatMap((ph) => ph.tasks);
    return {
      id: project.id,
      name: project.name,
      kind: project.kind,
      dueDate: project.dueDate ? project.dueDate.toISOString() : null,
      dueLabel: project.dueLabel,
      budgetText: project.budgetText,
      description: project.description,
      lead: project.lead ? this.memberDto(project.lead) : null,
      members: project.members.map((m) => this.memberDto(m.user)),
      taskCount: tasks.length,
      doneCount: tasks.filter((t) => t.done).length,
      phases: project.phases.map((ph) => this.phaseDto(ph)),
    };
  }
}
