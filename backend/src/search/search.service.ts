import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { SearchResultsDto } from '@g-hub/shared';
import { PrismaService } from '../prisma/prisma.service';

const TAKE = 8;

/**
 * Globale Suche (Bauplan §7, Punkt 12): aggregiert die bereits echten Fachbereiche
 * Kampagnen, Projekte, Aufgaben und Assets — workspace-gescopt, case-insensitive.
 * Beiträge/Team/News folgen, sobald deren Backends echt sind.
 */
@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(userId: string, q: string): Promise<SearchResultsDto> {
    const term = q.trim();
    if (term.length < 2) {
      return { campaigns: [], projects: [], tasks: [], assets: [] };
    }
    const workspaceId = await this.resolveWorkspaceId(userId);
    const like: Prisma.StringFilter = { contains: term, mode: 'insensitive' };

    const [campaigns, projects, tasks, assets] = await Promise.all([
      this.prisma.campaign.findMany({
        where: { workspaceId, name: like },
        orderBy: { createdAt: 'desc' },
        take: TAKE,
      }),
      this.prisma.project.findMany({
        where: { workspaceId, name: like },
        orderBy: { createdAt: 'desc' },
        take: TAKE,
      }),
      this.prisma.task.findMany({
        where: { workspaceId, title: like },
        orderBy: { createdAt: 'desc' },
        take: TAKE,
      }),
      this.prisma.asset.findMany({
        where: { workspaceId, tag: like },
        orderBy: { createdAt: 'desc' },
        take: TAKE,
      }),
    ]);

    return {
      campaigns: campaigns.map((c) => ({ id: c.id, title: c.name, sub: c.status })),
      projects: projects.map((p) => ({ id: p.id, title: p.name, sub: p.kind ?? 'Projekt' })),
      tasks: tasks.map((t) => ({ id: t.id, title: t.title, sub: t.tag ?? t.status })),
      assets: assets.map((a) => ({ id: a.id, title: a.tag, sub: a.kind })),
    };
  }

  private async resolveWorkspaceId(userId: string): Promise<string> {
    const membership = await this.prisma.membership.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    if (!membership) throw new ForbiddenException('Kein Workspace für diesen Nutzer.');
    return membership.workspaceId;
  }
}
