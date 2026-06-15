import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type {
  AbsenceBalanceDto,
  TimeEntryDto,
  TimeOverviewDto,
  WorkSettingsDto,
} from '@g-hub/shared';
import { PrismaService } from '../prisma/prisma.service';

type TimeEntryRow = Prisma.TimeEntryGetPayload<object>;

const WEEKDAY_LABELS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const MONTH_LABELS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

/** Mitternacht (UTC) des Tages zu `d` — als Schlüssel für TimeEntry.date. */
function dayKey(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

@Injectable()
export class TimeTrackingService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Heute ──────────────────────────────────────────────────
  async today(userId: string): Promise<TimeEntryDto | null> {
    await this.resolveWorkspaceId(userId);
    const entry = await this.currentEntry(userId);
    if (entry) return this.toDto(entry);
    // Sonst der letzte (abgeschlossene) Eintrag von heute, falls vorhanden.
    const last = await this.prisma.timeEntry.findFirst({
      where: { userId, date: dayKey(new Date()) },
      orderBy: { clockIn: 'desc' },
    });
    return last ? this.toDto(last) : null;
  }

  // ── Stempeln ───────────────────────────────────────────────
  async clockIn(userId: string): Promise<TimeEntryDto> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const open = await this.currentEntry(userId);
    if (open) throw new BadRequestException('Es läuft bereits eine Stempelung.');
    const now = new Date();
    const entry = await this.prisma.timeEntry.create({
      data: {
        workspaceId,
        userId,
        date: dayKey(now),
        clockIn: now,
        segmentStart: now,
        status: 'in',
      },
    });
    return this.toDto(entry);
  }

  async startBreak(userId: string): Promise<TimeEntryDto> {
    const entry = await this.requireOpen(userId);
    if (entry.status !== 'in') throw new BadRequestException('Pause nur aus dem Status „eingestempelt" möglich.');
    const now = new Date();
    const updated = await this.prisma.timeEntry.update({
      where: { id: entry.id },
      data: {
        workSeconds: entry.workSeconds + this.segment(entry, now),
        segmentStart: now,
        status: 'break',
      },
    });
    return this.toDto(updated);
  }

  async endBreak(userId: string): Promise<TimeEntryDto> {
    const entry = await this.requireOpen(userId);
    if (entry.status !== 'break') throw new BadRequestException('Keine laufende Pause.');
    const now = new Date();
    const updated = await this.prisma.timeEntry.update({
      where: { id: entry.id },
      data: {
        breakSeconds: entry.breakSeconds + this.segment(entry, now),
        segmentStart: now,
        status: 'in',
      },
    });
    return this.toDto(updated);
  }

  async clockOut(userId: string): Promise<TimeEntryDto> {
    const entry = await this.requireOpen(userId);
    const now = new Date();
    const data: Prisma.TimeEntryUpdateInput = { clockOut: now, segmentStart: null, status: 'out' };
    if (entry.status === 'in') data.workSeconds = entry.workSeconds + this.segment(entry, now);
    if (entry.status === 'break') data.breakSeconds = entry.breakSeconds + this.segment(entry, now);
    const updated = await this.prisma.timeEntry.update({ where: { id: entry.id }, data });
    return this.toDto(updated);
  }

  // ── Monats-/Wochenübersicht ────────────────────────────────
  async overview(userId: string): Promise<TimeOverviewDto> {
    await this.resolveWorkspaceId(userId);
    const now = new Date();

    // Aktuelle Woche (Mo–So) in UTC.
    const monday = dayKey(now);
    const dow = (monday.getUTCDay() + 6) % 7; // Mo=0
    monday.setUTCDate(monday.getUTCDate() - dow);
    const weekDays: Date[] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setUTCDate(monday.getUTCDate() + i);
      return d;
    });

    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    const entries = await this.prisma.timeEntry.findMany({
      where: { userId, date: { gte: monthStart, lt: monthEnd } },
    });

    const secondsOf = (e: TimeEntryRow): number =>
      e.workSeconds + (e.status === 'in' && e.segmentStart ? this.segment(e, now) : 0);

    const week = weekDays.map((d) => {
      const key = d.getTime();
      const seconds = entries
        .filter((e) => dayKey(e.date).getTime() === key)
        .reduce((s, e) => s + secondsOf(e), 0);
      return { date: this.isoDate(d), label: WEEKDAY_LABELS[d.getUTCDay()], seconds };
    });

    const monthSeconds = entries.reduce((s, e) => s + secondsOf(e), 0);
    const settings = await this.settings(userId);
    const targetSeconds = settings.monthlyTarget * 3600;
    const absence = await this.absence(userId, now.getUTCFullYear());

    return {
      week,
      monthLabel: `${MONTH_LABELS[now.getUTCMonth()]} ${now.getUTCFullYear()}`,
      monthSeconds,
      targetSeconds,
      balanceSeconds: monthSeconds - targetSeconds,
      absence,
      settings,
    };
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

  /** Der offene (noch nicht ausgestempelte) Eintrag, falls vorhanden. */
  private async currentEntry(userId: string): Promise<TimeEntryRow | null> {
    return this.prisma.timeEntry.findFirst({
      where: { userId, clockOut: null },
      orderBy: { clockIn: 'desc' },
    });
  }

  private async requireOpen(userId: string): Promise<TimeEntryRow> {
    await this.resolveWorkspaceId(userId);
    const entry = await this.currentEntry(userId);
    if (!entry) throw new BadRequestException('Keine laufende Stempelung.');
    return entry;
  }

  /** Sekunden seit dem Start des aktuellen Segments. */
  private segment(entry: TimeEntryRow, now: Date): number {
    if (!entry.segmentStart) return 0;
    return Math.max(0, Math.floor((now.getTime() - entry.segmentStart.getTime()) / 1000));
  }

  private async settings(userId: string): Promise<WorkSettingsDto> {
    const s = await this.prisma.workSettings.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
    return { weeklyTarget: s.weeklyTarget, monthlyTarget: s.monthlyTarget };
  }

  private async absence(userId: string, year: number): Promise<AbsenceBalanceDto> {
    const a = await this.prisma.absenceBalance.upsert({
      where: { userId_year: { userId, year } },
      create: { userId, year },
      update: {},
    });
    return {
      year: a.year,
      vacationTotal: a.vacationTotal,
      vacationUsed: a.vacationUsed,
      sickDays: a.sickDays,
      holidays: a.holidays,
    };
  }

  private isoDate(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  private toDto(e: TimeEntryRow): TimeEntryDto {
    return {
      id: e.id,
      date: this.isoDate(e.date),
      clockIn: e.clockIn.toISOString(),
      clockOut: e.clockOut ? e.clockOut.toISOString() : null,
      workSeconds: e.workSeconds,
      breakSeconds: e.breakSeconds,
      segmentStart: e.segmentStart ? e.segmentStart.toISOString() : null,
      status: e.status,
    };
  }
}
