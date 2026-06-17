import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { Notification } from '@prisma/client';
import type { NotificationDto } from '@g-hub/shared';
import { PrismaService } from '../prisma/prisma.service';
import { NOTIFICATION_SEED } from './notifications.seed-data';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Liste je Workspace (neueste zuerst). Beim ersten Abruf idempotent befüllt. */
  async list(userId: string): Promise<NotificationDto[]> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    await this.ensureSeeded(workspaceId);
    const items = await this.prisma.notification.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
    return items.map((n) => this.toDto(n));
  }

  /** Eine Mitteilung als gelesen markieren (workspace-gescopt). */
  async markRead(userId: string, id: string): Promise<NotificationDto> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const existing = await this.prisma.notification.findFirst({ where: { id, workspaceId } });
    if (!existing) throw new NotFoundException('Mitteilung nicht gefunden.');
    const updated = await this.prisma.notification.update({ where: { id }, data: { read: true } });
    return this.toDto(updated);
  }

  /** Alle Mitteilungen des Workspace als gelesen markieren. */
  async markAllRead(userId: string): Promise<{ status: string }> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    await this.prisma.notification.updateMany({
      where: { workspaceId, read: false },
      data: { read: true },
    });
    return { status: 'ok' };
  }

  /** Legt den Startbestand an, falls der Workspace noch keine Mitteilungen hat. */
  private async ensureSeeded(workspaceId: string): Promise<void> {
    const count = await this.prisma.notification.count({ where: { workspaceId } });
    if (count > 0) return;
    const now = Date.now();
    await this.prisma.notification.createMany({
      data: NOTIFICATION_SEED.map((s) => ({
        workspaceId,
        type: s.type,
        who: s.who,
        txt: s.txt,
        sub: s.sub,
        read: s.read,
        createdAt: new Date(now - s.agedMinutes * 60_000),
      })),
    });
  }

  private async resolveWorkspaceId(userId: string): Promise<string> {
    const membership = await this.prisma.membership.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    if (!membership) throw new ForbiddenException('Kein Workspace für diesen Nutzer.');
    return membership.workspaceId;
  }

  private toDto(n: Notification): NotificationDto {
    return {
      id: n.id,
      type: n.type,
      who: n.who,
      txt: n.txt,
      sub: n.sub,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    };
  }
}
