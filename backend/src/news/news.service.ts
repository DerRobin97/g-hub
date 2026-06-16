import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { News } from '@prisma/client';
import type { NewsDto } from '@g-hub/shared';
import { PrismaService } from '../prisma/prisma.service';
import { NEWS_SEED } from './news.seed-data';

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Liste je Workspace (neueste zuerst). Beim ersten Abruf idempotent befüllt. */
  async list(userId: string): Promise<NewsDto[]> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    await this.ensureSeeded(workspaceId);
    const items = await this.prisma.news.findMany({
      where: { workspaceId },
      orderBy: [{ highlight: 'desc' }, { publishedAt: 'desc' }],
    });
    return items.map((n) => this.toDto(n));
  }

  /** Einen Beitrag als gelesen markieren (workspace-gescopt). */
  async markRead(userId: string, id: string): Promise<NewsDto> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const existing = await this.prisma.news.findFirst({ where: { id, workspaceId } });
    if (!existing) throw new NotFoundException('News-Beitrag nicht gefunden.');
    const updated = await this.prisma.news.update({ where: { id }, data: { read: true } });
    return this.toDto(updated);
  }

  /** Alle Beiträge des Workspace als gelesen markieren. */
  async markAllRead(userId: string): Promise<{ status: string }> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    await this.prisma.news.updateMany({ where: { workspaceId, read: false }, data: { read: true } });
    return { status: 'ok' };
  }

  /** Legt den Startbestand an, falls der Workspace noch keine News hat. */
  private async ensureSeeded(workspaceId: string): Promise<void> {
    const count = await this.prisma.news.count({ where: { workspaceId } });
    if (count > 0) return;
    const now = Date.now();
    await this.prisma.news.createMany({
      data: NEWS_SEED.map((s) => ({
        workspaceId,
        category: s.category,
        title: s.title,
        teaser: s.teaser,
        source: s.source,
        tag: s.tag,
        highlight: s.highlight,
        read: s.read,
        publishedAt: new Date(now - s.agedMinutes * 60_000),
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

  private toDto(n: News): NewsDto {
    return {
      id: n.id,
      category: n.category,
      title: n.title,
      teaser: n.teaser,
      source: n.source,
      tag: n.tag,
      highlight: n.highlight,
      read: n.read,
      publishedAt: n.publishedAt.toISOString(),
    };
  }
}
