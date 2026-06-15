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
