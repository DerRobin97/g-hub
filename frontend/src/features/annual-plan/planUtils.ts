import {
  PLAN_CATEGORY_LABELS,
  PLAN_CHANNEL_LABELS,
  type PlanCategory,
  type PlanChannel,
} from '@g-hub/shared';

/** Farbe je Geschäftsbereich (Frontend-Konstante, vgl. Prototyp JP_CAT). */
export const CATEGORY_COLOR: Record<PlanCategory, string> = {
  verkauf: '#ee7203',
  service: '#3f9bff',
  vermietung: '#3fe0d0',
  saison: '#5fb85f',
  frist: '#e8654f',
};

/** Reihenfolge der Bereichs-Gruppen im Monats-Detail (vgl. JP_BEREICH). */
export const CATEGORY_ORDER: PlanCategory[] = ['verkauf', 'frist', 'vermietung', 'saison', 'service'];

export function categoryLabel(cat: PlanCategory): string {
  return PLAN_CATEGORY_LABELS[cat];
}

/** Farbe je Kanal (Frontend-Konstante, vgl. Prototyp JP_KAN). */
export const CHANNEL_COLOR: Record<PlanChannel, string> = {
  social: '#e1568b',
  ads: '#4285F4',
  newsletter: '#ee7203',
  flyer: '#5fb85f',
};

export function channelLabel(ch: string): string {
  return PLAN_CHANNEL_LABELS[ch as PlanChannel] ?? ch;
}

export function channelColor(ch: string): string {
  return CHANNEL_COLOR[ch as PlanChannel] ?? 'var(--text-3)';
}

/** Kürzel (3 Buchstaben) je Monat 1..12 — wie `ab` im Prototyp. */
export const MONTH_ABBR = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

/** Voller Monatsname 1..12. */
export const MONTH_NAME = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

export function monthAbbr(month: number): string {
  return MONTH_ABBR[month - 1] ?? String(month);
}

export function monthName(month: number): string {
  return MONTH_NAME[month - 1] ?? String(month);
}

/** Aktuelles Jahr (für die Standard-Ansicht). */
export function currentYear(): number {
  return new Date().getFullYear();
}

/** Aktueller Monat 1..12. */
export function currentMonth(): number {
  return new Date().getMonth() + 1;
}
