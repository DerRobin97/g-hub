import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DEMO_CAMPAIGNS, DEMO_PROJECTS, DEMO_TASKS } from './demo.data';
import { PLAN_SEED_MONTHS } from '../plan/plan.seed-data';

// Marker auf den Demo-Aufgaben → erlaubt „bereits geseedet?"-Erkennung.
const DEMO_TAG = 'Demo';

function quarterOf(month: number): number {
  return Math.floor((month - 1) / 3) + 1;
}

@Injectable()
export class DemoService {
  constructor(private readonly prisma: PrismaService) {}

  /** Füllt den Workspace mit Demo-Daten (idempotent: überspringt, wenn bereits vorhanden). */
  async seed(userId: string): Promise<{ status: string }> {
    const workspaceId = await this.resolveWorkspaceId(userId);

    const marker = await this.prisma.task.findFirst({ where: { workspaceId, tag: DEMO_TAG } });
    if (marker) return { status: 'exists' };

    // Aufgaben (dem eingeloggten Nutzer zugewiesen).
    for (const t of DEMO_TASKS) {
      await this.prisma.task.create({
        data: {
          workspaceId,
          createdById: userId,
          title: t.title,
          description: t.description ?? null,
          projectText: t.projectText ?? null,
          dueLabel: t.dueLabel ?? null,
          time: t.time ?? null,
          priority: t.priority,
          status: t.status,
          tag: DEMO_TAG,
          completedAt: t.status === 'erledigt' ? new Date() : null,
          assignees: { create: [{ userId }] },
          checklist: {
            create: (t.checklist ?? []).map((title, i) => ({ title, done: false, position: i })),
          },
        },
      });
    }

    // Projekte mit Phasen + Phasen-Aufgaben.
    for (const p of DEMO_PROJECTS) {
      await this.prisma.project.create({
        data: {
          workspaceId,
          createdById: userId,
          leadId: userId,
          name: p.name,
          kind: p.kind ?? null,
          dueLabel: p.dueLabel ?? null,
          budgetText: p.budgetText ?? null,
          description: p.description ?? null,
          members: { create: [{ userId }] },
          phases: {
            create: p.phases.map((ph, pi) => ({
              name: ph.name,
              order: pi,
              tasks: {
                create: ph.tasks.map((tk, ti) => ({
                  title: tk.title,
                  priority: tk.priority,
                  done: tk.done ?? false,
                  completedAt: tk.done ? new Date() : null,
                  dueLabel: tk.dueLabel ?? null,
                  order: ti,
                })),
              },
            })),
          },
        },
      });
    }

    // Kampagnen mit Maßnahmen + Rabatten (verschachtelt).
    for (const [ci, c] of DEMO_CAMPAIGNS.entries()) {
      await this.prisma.campaign.create({
        data: {
          workspaceId,
          createdById: userId,
          name: c.name,
          status: c.status,
          channels: c.channels,
          budget: c.budget,
          spent: c.spent,
          reach: c.reach,
          kpiText: c.kpiText ?? null,
          zeitraum: c.zeitraum ?? null,
          dueLabel: c.dueLabel ?? null,
          color: c.color ?? null,
          measures: {
            create: c.measures.map((m, mi) => ({
              name: m.name,
              type: m.type,
              status: m.status,
              progress: m.progress,
              postsCount: m.postsCount,
              order: mi,
              discounts: {
                create: (m.discounts ?? []).map((d, di) => ({
                  name: d.name,
                  type: d.type,
                  value: d.value ?? null,
                  code: d.code ?? null,
                  zeitraum: d.zeitraum ?? null,
                  redeemed: d.redeemed ?? 0,
                  limit: d.limit ?? 0,
                  order: di,
                })),
              },
            })),
          },
        },
      });
      void ci;
    }

    // Jahresplan für das aktuelle Jahr (falls noch leer).
    const year = new Date().getFullYear();
    const planCount = await this.prisma.planMonth.count({ where: { workspaceId, year } });
    if (planCount === 0) {
      for (const m of PLAN_SEED_MONTHS) {
        await this.prisma.planMonth.create({
          data: {
            workspaceId,
            year,
            month: m.month,
            quarter: quarterOf(m.month),
            focus: m.focus,
            themes: {
              create: m.themes.map((t, i) => ({
                title: t.title,
                description: t.description,
                category: t.category,
                channels: t.channels,
                order: i,
              })),
            },
            links: {
              create: m.links.map((l, i) => ({
                direction: l.direction,
                targetMonth: l.targetMonth,
                text: l.text,
                order: i,
              })),
            },
          },
        });
      }
    }

    return { status: 'seeded' };
  }

  /**
   * Entfernt alle Inhalte der betroffenen Module für den Workspace.
   * ACHTUNG: löscht ALLE Aufgaben/Projekte/Kampagnen/Jahresplan/News/Mitteilungen
   * des Workspace (nicht nur Demo) — gedacht für die Demo-Phase.
   */
  async clear(userId: string): Promise<{ status: string }> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    await this.prisma.task.deleteMany({ where: { workspaceId } });
    await this.prisma.project.deleteMany({ where: { workspaceId } });
    await this.prisma.campaign.deleteMany({ where: { workspaceId } });
    await this.prisma.planMonth.deleteMany({ where: { workspaceId } });
    await this.prisma.news.deleteMany({ where: { workspaceId } });
    await this.prisma.notification.deleteMany({ where: { workspaceId } });
    return { status: 'cleared' };
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
