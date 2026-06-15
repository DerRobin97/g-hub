import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { TaskDto } from '@g-hub/shared';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateTaskDto } from './dto/create-task.dto';
import type { UpdateTaskDto } from './dto/update-task.dto';
import type { QueryTasksDto } from './dto/query-tasks.dto';

// Einheitlicher Include für alle Task-Abfragen → vollständiges TaskDto.
const TASK_INCLUDE = {
  assignees: { include: { user: true } },
  checklist: { orderBy: { position: 'asc' } },
} satisfies Prisma.TaskInclude;

type TaskWithRelations = Prisma.TaskGetPayload<{ include: typeof TASK_INCLUDE }>;

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, query: QueryTasksDto): Promise<TaskDto[]> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const where: Prisma.TaskWhereInput = { workspaceId };

    if (query.assignee === 'me') where.assignees = { some: { userId } };
    if (query.status) where.status = query.status;
    if (query.date) {
      const start = new Date(`${query.date}T00:00:00.000Z`);
      const end = new Date(`${query.date}T23:59:59.999Z`);
      where.dueDate = { gte: start, lte: end };
    }

    const tasks = await this.prisma.task.findMany({
      where,
      include: TASK_INCLUDE,
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    });
    return tasks.map((t) => this.toDto(t));
  }

  async get(userId: string, id: string): Promise<TaskDto> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const task = await this.prisma.task.findFirst({
      where: { id, workspaceId },
      include: TASK_INCLUDE,
    });
    if (!task) throw new NotFoundException('Aufgabe nicht gefunden.');
    return this.toDto(task);
  }

  async create(userId: string, dto: CreateTaskDto): Promise<TaskDto> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const assigneeIds = await this.resolveAssignees(workspaceId, userId, dto.assigneeIds);

    const task = await this.prisma.task.create({
      data: {
        workspaceId,
        createdById: userId,
        title: dto.title,
        description: dto.description ?? null,
        projectText: dto.projectText ?? null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        dueLabel: dto.dueLabel ?? null,
        time: dto.time ?? null,
        priority: dto.priority ?? 'med',
        status: dto.status ?? 'offen',
        role: dto.role ?? 'lead',
        tag: dto.tag ?? null,
        completedAt: dto.status === 'erledigt' ? new Date() : null,
        assignees: { create: assigneeIds.map((aid) => ({ userId: aid })) },
        checklist: {
          create: (dto.checklist ?? []).map((c, i) => ({
            title: c.title,
            done: c.done ?? false,
            position: i,
          })),
        },
      },
      include: TASK_INCLUDE,
    });
    return this.toDto(task);
  }

  async update(userId: string, id: string, dto: UpdateTaskDto): Promise<TaskDto> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const existing = await this.prisma.task.findFirst({ where: { id, workspaceId } });
    if (!existing) throw new NotFoundException('Aufgabe nicht gefunden.');

    const data: Prisma.TaskUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.projectText !== undefined) data.projectText = dto.projectText;
    if (dto.dueDate !== undefined) data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    if (dto.dueLabel !== undefined) data.dueLabel = dto.dueLabel;
    if (dto.time !== undefined) data.time = dto.time;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.tag !== undefined) data.tag = dto.tag;
    if (dto.status !== undefined) {
      data.status = dto.status;
      // completedAt am Status koppeln (erledigt → jetzt; sonst zurücksetzen).
      if (dto.status === 'erledigt' && existing.status !== 'erledigt') data.completedAt = new Date();
      if (dto.status !== 'erledigt') data.completedAt = null;
    }
    if (dto.assigneeIds !== undefined) {
      const ids = await this.resolveAssignees(workspaceId, userId, dto.assigneeIds);
      data.assignees = { deleteMany: {}, create: ids.map((aid) => ({ userId: aid })) };
    }
    if (dto.checklist !== undefined) {
      data.checklist = {
        deleteMany: {},
        create: dto.checklist.map((c, i) => ({
          title: c.title,
          done: c.done ?? false,
          position: i,
        })),
      };
    }

    const task = await this.prisma.task.update({
      where: { id },
      data,
      include: TASK_INCLUDE,
    });
    return this.toDto(task);
  }

  async remove(userId: string, id: string): Promise<{ status: string }> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const existing = await this.prisma.task.findFirst({ where: { id, workspaceId } });
    if (!existing) throw new NotFoundException('Aufgabe nicht gefunden.');
    await this.prisma.task.delete({ where: { id } });
    return { status: 'ok' };
  }

  /** Ermittelt den (ersten) Workspace des Nutzers für die Mandantentrennung. */
  private async resolveWorkspaceId(userId: string): Promise<string> {
    const membership = await this.prisma.membership.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    if (!membership) throw new ForbiddenException('Kein Workspace für diesen Nutzer.');
    return membership.workspaceId;
  }

  /** Beschränkt Beteiligte auf Workspace-Mitglieder; Fallback: der Nutzer selbst. */
  private async resolveAssignees(
    workspaceId: string,
    userId: string,
    requested: string[] | undefined,
  ): Promise<string[]> {
    if (!requested || requested.length === 0) return [userId];
    const members = await this.prisma.membership.findMany({
      where: { workspaceId, userId: { in: requested } },
      select: { userId: true },
    });
    const allowed = members.map((m) => m.userId);
    return allowed.length > 0 ? Array.from(new Set(allowed)) : [userId];
  }

  private toDto(task: TaskWithRelations): TaskDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      projectText: task.projectText,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      dueLabel: task.dueLabel,
      time: task.time,
      priority: task.priority,
      status: task.status,
      role: task.role,
      tag: task.tag,
      completedAt: task.completedAt ? task.completedAt.toISOString() : null,
      createdById: task.createdById,
      assignees: task.assignees.map((a) => ({
        userId: a.userId,
        name: a.user.name,
        avatarUrl: a.user.avatarUrl,
      })),
      checklist: task.checklist.map((c) => ({ id: c.id, title: c.title, done: c.done })),
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }
}
