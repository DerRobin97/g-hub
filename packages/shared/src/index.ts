/**
 * @g-hub/shared — geteilte Typen/Konstanten für Frontend und Backend.
 *
 * Quelle der Wahrheit für Enums, die in DB-Schema, API und UI identisch
 * verwendet werden. Abgeleitet aus dem Bauplan §4 (Datenmodell).
 */

export const APP_VERSION = '0.1.0';

// --- Rollen (Membership) — Bauplan §4.1 ---
export const ROLES = [
  'owner',
  'admin',
  'content_lead',
  'designer',
  'social_manager',
  'analyst',
  'member',
] as const;
export type Role = (typeof ROLES)[number];

// --- Channels — Bauplan §4.2 ---
export const CHANNELS = ['instagram', 'facebook', 'linkedin', 'x', 'tiktok', 'youtube'] as const;
export type Channel = (typeof CHANNELS)[number];

// --- Post-Status (Pipeline) — Bauplan §4.3 ---
export const POST_STATUS = ['entwurf', 'freigabe', 'geplant', 'live'] as const;
export type PostStatus = (typeof POST_STATUS)[number];

// --- Task-Status — Bauplan §4.6 ---
export const TASK_STATUS = ['offen', 'arbeit', 'erledigt'] as const;
export type TaskStatus = (typeof TASK_STATUS)[number];

export const TASK_PRIORITY = ['high', 'med', 'low'] as const;
export type TaskPriority = (typeof TASK_PRIORITY)[number];

// Rolle des/der Beteiligten an einer Aufgabe (Verantwortlich vs. Mitwirkend).
export const TASK_ROLES = ['lead', 'collab'] as const;
export type TaskRole = (typeof TASK_ROLES)[number];

// Geteilte Form einer Aufgabe für API + Frontend (Bauplan §4.6).
export interface ChecklistItemDto {
  id: string;
  title: string;
  done: boolean;
}

export interface TaskAssigneeDto {
  userId: string;
  name: string;
  avatarUrl: string | null;
}

export interface TaskDto {
  id: string;
  title: string;
  description: string | null;
  projectText: string | null;
  dueDate: string | null;
  dueLabel: string | null;
  time: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  role: TaskRole;
  tag: string | null;
  completedAt: string | null;
  createdById: string;
  assignees: TaskAssigneeDto[];
  checklist: ChecklistItemDto[];
  createdAt: string;
  updatedAt: string;
}

// --- Projektmanager — Bauplan §4.5 ---
export const PROJECT_TASK_PRIORITY = ['high', 'mid', 'low'] as const;
export type ProjectTaskPriority = (typeof PROJECT_TASK_PRIORITY)[number];

export interface ProjectMemberDto {
  userId: string;
  name: string;
  avatarUrl: string | null;
}

export interface ProjectTaskDto {
  id: string;
  phaseId: string;
  title: string;
  description: string | null;
  done: boolean;
  completedAt: string | null;
  dueDate: string | null;
  dueLabel: string | null;
  priority: ProjectTaskPriority;
  links: string[];
  order: number;
  members: ProjectMemberDto[];
}

export interface PhaseDto {
  id: string;
  name: string;
  order: number;
  tasks: ProjectTaskDto[];
}

export interface ProjectSummaryDto {
  id: string;
  name: string;
  kind: string | null;
  dueDate: string | null;
  dueLabel: string | null;
  budgetText: string | null;
  lead: ProjectMemberDto | null;
  members: ProjectMemberDto[];
  taskCount: number;
  doneCount: number;
}

export interface ProjectDetailDto extends ProjectSummaryDto {
  description: string | null;
  phases: PhaseDto[];
}

// --- Kampagnen — Bauplan §4.4 ---
// Status für Kampagnen und Maßnahmen (deckt sich mit StatusTag im Frontend).
export const CAMPAIGN_STATUS = ['live', 'review', 'draft'] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUS)[number];

// Maßnahmen-Art. Maschinen-Schlüssel; Anzeige-Labels via MEASURE_TYPE_LABELS.
export const MEASURE_TYPES = ['organisch', 'promotion', 'paid', 'code'] as const;
export type MeasureType = (typeof MEASURE_TYPES)[number];

export const MEASURE_TYPE_LABELS: Record<MeasureType, string> = {
  organisch: 'Organisch',
  promotion: 'Promotion',
  paid: 'Paid',
  code: 'Code',
};

// Rabatt-Art. Maschinen-Schlüssel; Anzeige-Labels via DISCOUNT_TYPE_LABELS.
export const DISCOUNT_TYPES = ['prozent', 'zwei_fuer_eins', 'versand', 'code'] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  prozent: 'Prozent',
  zwei_fuer_eins: '2 für 1',
  versand: 'Versand',
  code: 'Code',
};

export interface DiscountDto {
  id: string;
  measureId: string;
  name: string;
  type: DiscountType;
  value: string | null;
  code: string | null;
  zeitraum: string | null;
  redeemed: number;
  limit: number;
  order: number;
}

export interface MeasureDto {
  id: string;
  campaignId: string;
  name: string;
  type: MeasureType;
  status: CampaignStatus;
  progress: number;
  postsCount: number;
  order: number;
  discounts: DiscountDto[];
}

export interface CampaignSummaryDto {
  id: string;
  name: string;
  status: CampaignStatus;
  channels: string[];
  budget: number;
  spent: number;
  reach: number;
  kpiText: string | null;
  zeitraum: string | null;
  dueLabel: string | null;
  color: string | null;
  measureCount: number;
  discountCount: number;
}

export interface CampaignDetailDto extends CampaignSummaryDto {
  measures: MeasureDto[];
}

// --- Jahresplan — Bauplan §4.8 ---
// Geschäftsbereich eines Themas. Maschinen-Schlüssel; Labels via PLAN_CATEGORY_LABELS.
export const PLAN_CATEGORIES = ['verkauf', 'service', 'vermietung', 'saison', 'frist'] as const;
export type PlanCategory = (typeof PLAN_CATEGORIES)[number];

export const PLAN_CATEGORY_LABELS: Record<PlanCategory, string> = {
  verkauf: 'Verkauf',
  service: 'Werkstatt',
  vermietung: 'Vermietung',
  saison: 'Saison',
  frist: 'Frist',
};

// Kanäle des Jahresplans (eigene Liste, nicht die Social-CHANNELS aus §4.2).
export const PLAN_CHANNELS = ['social', 'ads', 'newsletter', 'flyer'] as const;
export type PlanChannel = (typeof PLAN_CHANNELS)[number];

export const PLAN_CHANNEL_LABELS: Record<PlanChannel, string> = {
  social: 'Social',
  ads: 'Google Ads',
  newsletter: 'Newsletter',
  flyer: 'Flyer',
};

// Richtung einer Verzahnung (Rück-/Vorverweis).
export const PLAN_LINK_DIRECTIONS = ['back', 'fwd'] as const;
export type PlanLinkDirection = (typeof PLAN_LINK_DIRECTIONS)[number];

export interface PlanThemeDto {
  id: string;
  planMonthId: string;
  title: string;
  description: string | null;
  category: PlanCategory;
  channels: string[];
  order: number;
}

export interface PlanLinkDto {
  id: string;
  planMonthId: string;
  direction: PlanLinkDirection;
  targetMonth: string;
  text: string;
  order: number;
}

export interface PlanMonthDto {
  id: string;
  year: number;
  month: number;
  quarter: number;
  focus: string | null;
  themes: PlanThemeDto[];
  links: PlanLinkDto[];
}

// --- Analytics-Quellen — Bauplan §4.10 ---
export const METRIC_SOURCES = ['gesamt', 'google', 'meta'] as const;
export type MetricSource = (typeof METRIC_SOURCES)[number];

// --- Zeiterfassung — Bauplan §4.11 ---
// Zustand der Stempeluhr (out→in→break→in→out).
export const TIME_STATUS = ['in', 'break', 'out'] as const;
export type TimeStatus = (typeof TIME_STATUS)[number];

export interface TimeEntryDto {
  id: string;
  date: string; // YYYY-MM-DD
  clockIn: string;
  clockOut: string | null;
  workSeconds: number;
  breakSeconds: number;
  // Start des aktuellen Segments (für die Live-Berechnung im Frontend).
  segmentStart: string | null;
  status: TimeStatus;
}

export interface AbsenceBalanceDto {
  year: number;
  vacationTotal: number;
  vacationUsed: number;
  sickDays: number;
  holidays: number;
}

export interface WorkSettingsDto {
  weeklyTarget: number;
  monthlyTarget: number;
}

export interface TimeDayDto {
  date: string; // YYYY-MM-DD
  label: string; // Mo, Di, …
  seconds: number;
}

export interface TimeOverviewDto {
  week: TimeDayDto[];
  monthLabel: string;
  monthSeconds: number;
  targetSeconds: number;
  balanceSeconds: number;
  absence: AbsenceBalanceDto;
  settings: WorkSettingsDto;
}

// --- Assets — Bauplan §4.7 ---
// Art des Assets (Anzeige-Label wie im Prototyp / UI-Filter).
export const ASSET_KINDS = ['Bild', 'Video', 'Datei'] as const;
export type AssetKind = (typeof ASSET_KINDS)[number];

export interface AssetDto {
  id: string;
  tag: string;
  kind: AssetKind;
  mime: string;
  size: number;
  channel: string | null;
  uploadedById: string | null;
  createdAt: string;
  // Presigned GET-URL (zeitlich begrenzt) für Vorschau/Download.
  url: string;
}

// Antwort auf die Anforderung einer presigned Upload-URL.
export interface UploadUrlDto {
  // Objekt-Schlüssel im Bucket — beim anschließenden Anlegen des Assets mitgeben.
  storageKey: string;
  // Presigned PUT-URL: Datei-Bytes direkt vom Browser hierher hochladen.
  uploadUrl: string;
}

// --- Branchen-News & Trends (Dashboard/News-Sektion) ---
// Kategorie = Anzeige-Label wie im Prototyp (UI-Filter „Trend/Plattform/Mention").
export const NEWS_CATEGORIES = ['Trend', 'Plattform', 'Mention'] as const;
export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export interface NewsDto {
  id: string;
  category: NewsCategory;
  title: string;
  teaser: string | null;
  source: string;
  tag: string | null;
  highlight: boolean;
  read: boolean;
  // ISO-Zeitstempel; das Frontend bildet daraus das relative Label.
  publishedAt: string;
}

// --- Globale Suche — Bauplan §5.1 / §7 (Punkt 12) ---
export interface SearchHitDto {
  id: string;
  title: string;
  sub: string;
}

export interface SearchResultsDto {
  campaigns: SearchHitDto[];
  projects: SearchHitDto[];
  tasks: SearchHitDto[];
  assets: SearchHitDto[];
}

// --- Darstellung / Appearance — Bauplan §4.1 / §6.4 ---
export const THEMES = ['light', 'gray', 'dark'] as const;
export type ThemeName = (typeof THEMES)[number];

// Benannte Akzente + frei wählbare Farbe ('custom').
export const ACCENT_OPTIONS = ['gruen', 'orange', 'custom'] as const;
export type AccentOption = (typeof ACCENT_OPTIONS)[number];

// Desktop-Layout-Varianten der Web-Shell.
export const WEB_LAYOUTS = ['full', 'rail', 'dual'] as const;
export type WebLayout = (typeof WEB_LAYOUTS)[number];

// Eck-Rundungen der Oberfläche.
export const CORNER_STYLES = ['soft', 'standard', 'sharp'] as const;
export type CornerStyle = (typeof CORNER_STYLES)[number];
