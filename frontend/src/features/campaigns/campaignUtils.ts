import {
  DISCOUNT_TYPE_LABELS,
  MEASURE_TYPE_LABELS,
  type CampaignStatus,
  type DiscountType,
  type MeasureType,
} from '@g-hub/shared';

/** Kanal-Metadaten (Farbe + Kürzel) — wie ChannelBadge im Prototyp. */
export const CHANNEL_META: Record<string, { color: string; short: string; label: string }> = {
  instagram: { color: 'var(--ch-instagram)', short: 'IG', label: 'Instagram' },
  facebook: { color: 'var(--ch-facebook)', short: 'FB', label: 'Facebook' },
  linkedin: { color: 'var(--ch-linkedin)', short: 'LI', label: 'LinkedIn' },
  x: { color: 'var(--ch-x)', short: 'X', label: 'X' },
  tiktok: { color: 'var(--ch-tiktok)', short: 'TT', label: 'TikTok' },
  youtube: { color: 'var(--ch-youtube)', short: 'YT', label: 'YouTube' },
};

export function channelMeta(channel: string): { color: string; short: string; label: string } {
  return CHANNEL_META[channel] ?? { color: 'var(--text-3)', short: channel.slice(0, 2).toUpperCase(), label: channel };
}

/** Farbton je Maßnahmen-Art (analog KM_TYP_TONE im Prototyp). */
export const MEASURE_TYPE_TONE: Record<MeasureType, string> = {
  organisch: 'var(--ch-linkedin)',
  promotion: 'var(--accent)',
  paid: 'var(--ch-instagram)',
  code: 'var(--warn)',
};

export function measureTypeLabel(type: MeasureType): string {
  return MEASURE_TYPE_LABELS[type];
}

export function discountTypeLabel(type: DiscountType): string {
  return DISCOUNT_TYPE_LABELS[type];
}

/** Default-Akzentfarbe einer Kampagne, falls keine gesetzt ist. */
export function campaignColor(color: string | null): string {
  return color ?? 'var(--accent)';
}

/** Tausenderformat (de-DE), z. B. 142000 → „142.000". */
export function fmtNum(n: number): string {
  return n.toLocaleString('de-DE');
}

/** Anteil 0..1 für Budget-Ringe; sicher gegen Division durch 0. */
export function ratio(part: number, whole: number): number {
  return whole > 0 ? Math.min(1, part / whole) : 0;
}

export const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = {
  live: 'Live',
  review: 'Review',
  draft: 'Entwurf',
};
