import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { PlanLinkDto, PlanMonthDto, PlanThemeDto } from '@g-hub/shared';
import { PrismaService } from '../prisma/prisma.service';
import type { CreatePlanThemeDto, UpdatePlanThemeDto } from './dto/theme.dto';
import type { CreatePlanLinkDto, UpdatePlanLinkDto } from './dto/link.dto';
import type { UpdatePlanMonthDto } from './dto/month.dto';
import { PLAN_SEED_MONTHS } from './plan.seed-data';

const MONTH_INCLUDE = {
  themes: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] },
  links: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] },
} satisfies Prisma.PlanMonthInclude;

type PlanMonthRow = Prisma.PlanMonthGetPayload<{ include: typeof MONTH_INCLUDE }>;
type ThemeRow = PlanMonthRow['themes'][number];
type LinkRow = PlanMonthRow['links'][number];

function quarterOf(month: number): number {
  return Math.floor((month - 1) / 3) + 1;
}

@Injectable()
export class PlanService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Jahr lesen ─────────────────────────────────────────────
  async listYear(userId: string, year: number): Promise<PlanMonthDto[]> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const months = await this.prisma.planMonth.findMany({
      where: { workspaceId, year },
      include: MONTH_INCLUDE,
      orderBy: { month: 'asc' },
    });
    return months.map((m) => this.monthDto(m));
  }

  // ── Monat (Leitmotiv) ──────────────────────────────────────
  async updateMonth(
    userId: string,
    year: number,
    month: number,
    dto: UpdatePlanMonthDto,
  ): Promise<PlanMonthDto> {
    const row = await this.ensureMonth(userId, year, month);
    const updated = await this.prisma.planMonth.update({
      where: { id: row.id },
      data: { focus: dto.focus ?? null },
      include: MONTH_INCLUDE,
    });
    return this.monthDto(updated);
  }

  // ── Themen ─────────────────────────────────────────────────
  async createTheme(
    userId: string,
    year: number,
    month: number,
    dto: CreatePlanThemeDto,
  ): Promise<PlanMonthDto> {
    const row = await this.ensureMonth(userId, year, month);
    const order = await this.prisma.planTheme.count({ where: { planMonthId: row.id } });
    await this.prisma.planTheme.create({
      data: {
        planMonthId: row.id,
        title: dto.title,
        description: dto.description ?? null,
        category: dto.category ?? 'verkauf',
        channels: dto.channels ?? [],
        order,
      },
    });
    return this.getMonthById(row.id);
  }

  async updateTheme(userId: string, themeId: string, dto: UpdatePlanThemeDto): Promise<PlanThemeDto> {
    const theme = await this.ensureTheme(userId, themeId);
    const data: Prisma.PlanThemeUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.channels !== undefined) data.channels = dto.channels;
    const updated = await this.prisma.planTheme.update({ where: { id: theme.id }, data });
    return this.themeDto(updated);
  }

  async removeTheme(userId: string, themeId: string): Promise<{ status: string }> {
    const theme = await this.ensureTheme(userId, themeId);
    await this.prisma.planTheme.delete({ where: { id: theme.id } });
    return { status: 'ok' };
  }

  // ── Verzahnungen ───────────────────────────────────────────
  async createLink(
    userId: string,
    year: number,
    month: number,
    dto: CreatePlanLinkDto,
  ): Promise<PlanMonthDto> {
    const row = await this.ensureMonth(userId, year, month);
    const order = await this.prisma.planLink.count({ where: { planMonthId: row.id } });
    await this.prisma.planLink.create({
      data: {
        planMonthId: row.id,
        direction: dto.direction,
        targetMonth: dto.targetMonth,
        text: dto.text,
        order,
      },
    });
    return this.getMonthById(row.id);
  }

  async updateLink(userId: string, linkId: string, dto: UpdatePlanLinkDto): Promise<PlanLinkDto> {
    const link = await this.ensureLink(userId, linkId);
    const data: Prisma.PlanLinkUpdateInput = {};
    if (dto.direction !== undefined) data.direction = dto.direction;
    if (dto.targetMonth !== undefined) data.targetMonth = dto.targetMonth;
    if (dto.text !== undefined) data.text = dto.text;
    const updated = await this.prisma.planLink.update({ where: { id: link.id }, data });
    return this.linkDto(updated);
  }

  async removeLink(userId: string, linkId: string): Promise<{ status: string }> {
    const link = await this.ensureLink(userId, linkId);
    await this.prisma.planLink.delete({ where: { id: link.id } });
    return { status: 'ok' };
  }

  // ── Seed (workspace-gescopt, idempotent) ───────────────────
  async seedYear(userId: string, year: number): Promise<PlanMonthDto[]> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const existing = await this.prisma.planMonth.count({ where: { workspaceId, year } });
    if (existing === 0) {
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
    return this.listYear(userId, year);
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

  /** Lädt einen Monat des Workspace; legt ihn an, falls noch nicht vorhanden. */
  private async ensureMonth(userId: string, year: number, month: number): Promise<{ id: string }> {
    if (month < 1 || month > 12) throw new NotFoundException('Ungültiger Monat.');
    const workspaceId = await this.resolveWorkspaceId(userId);
    const existing = await this.prisma.planMonth.findUnique({
      where: { workspaceId_year_month: { workspaceId, year, month } },
      select: { id: true },
    });
    if (existing) return existing;
    const created = await this.prisma.planMonth.create({
      data: { workspaceId, year, month, quarter: quarterOf(month) },
      select: { id: true },
    });
    return created;
  }

  private async ensureTheme(userId: string, themeId: string): Promise<{ id: string }> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const theme = await this.prisma.planTheme.findFirst({
      where: { id: themeId, planMonth: { workspaceId } },
      select: { id: true },
    });
    if (!theme) throw new NotFoundException('Thema nicht gefunden.');
    return theme;
  }

  private async ensureLink(userId: string, linkId: string): Promise<{ id: string }> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const link = await this.prisma.planLink.findFirst({
      where: { id: linkId, planMonth: { workspaceId } },
      select: { id: true },
    });
    if (!link) throw new NotFoundException('Verzahnung nicht gefunden.');
    return link;
  }

  private async getMonthById(id: string): Promise<PlanMonthDto> {
    const month = await this.prisma.planMonth.findUniqueOrThrow({ where: { id }, include: MONTH_INCLUDE });
    return this.monthDto(month);
  }

  // ── Mapper ─────────────────────────────────────────────────
  private themeDto(t: ThemeRow): PlanThemeDto {
    return {
      id: t.id,
      planMonthId: t.planMonthId,
      title: t.title,
      description: t.description,
      category: t.category,
      channels: t.channels,
      order: t.order,
    };
  }

  private linkDto(l: LinkRow): PlanLinkDto {
    return {
      id: l.id,
      planMonthId: l.planMonthId,
      direction: l.direction,
      targetMonth: l.targetMonth,
      text: l.text,
      order: l.order,
    };
  }

  private monthDto(m: PlanMonthRow): PlanMonthDto {
    return {
      id: m.id,
      year: m.year,
      month: m.month,
      quarter: m.quarter,
      focus: m.focus,
      themes: m.themes.map((t) => this.themeDto(t)),
      links: m.links.map((l) => this.linkDto(l)),
    };
  }
}
