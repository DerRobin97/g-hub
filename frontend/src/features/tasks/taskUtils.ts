import type { TaskPriority, TaskRole } from '@g-hub/shared';

export const PRIO: Record<TaskPriority, { color: string; label: string }> = {
  high: { color: 'var(--bad)', label: 'Hoch' },
  med: { color: 'var(--warn)', label: 'Mittel' },
  low: { color: 'var(--text-3)', label: 'Niedrig' },
};

export function roleLabel(role: TaskRole): { label: string; accent: boolean } {
  return role === 'lead'
    ? { label: 'Verantwortlich', accent: true }
    : { label: 'Mitwirkend', accent: false };
}

export const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  offen: { label: 'Offen', color: 'var(--text-3)' },
  arbeit: { label: 'In Arbeit', color: 'var(--ch-linkedin, #0a66c2)' },
  erledigt: { label: 'Erledigt', color: 'var(--ok)' },
};

const DOW = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

/** Lokales YYYY-MM-DD (ohne Zeitzonen-Verschiebung). */
export function isoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Datums-Anteil einer ISO-Zeitangabe als lokaler Tag. */
export function dayOf(iso: string | null): string | null {
  if (!iso) return null;
  return isoDay(new Date(iso));
}

export function todayIso(): string {
  return isoDay(new Date());
}

/** Montag der Woche, in der `d` liegt. */
export function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const dow = (date.getDay() + 6) % 7; // Mo=0 … So=6
  date.setDate(date.getDate() - dow);
  date.setHours(0, 0, 0, 0);
  return date;
}

export interface WeekDay {
  date: Date;
  iso: string;
  dow: string;
  num: number;
}

export function weekDays(anchor: Date): WeekDay[] {
  const start = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return { date, iso: isoDay(date), dow: DOW[i], num: date.getDate() };
  });
}

export function formatDayLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return `${d.getDate()}. ${MONTHS[d.getMonth()]}`;
}

export function kwOf(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const diff = date.getTime() - firstThursday.getTime();
  return 1 + Math.round(diff / (7 * 24 * 3600 * 1000));
}
