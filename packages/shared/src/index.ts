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

// --- Analytics-Quellen — Bauplan §4.10 ---
export const METRIC_SOURCES = ['gesamt', 'google', 'meta'] as const;
export type MetricSource = (typeof METRIC_SOURCES)[number];

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
