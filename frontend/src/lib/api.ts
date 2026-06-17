/**
 * Minimaler API-Client. Basis-URL aus VITE_API_URL (Default: /api via Vite-Proxy).
 * Wird in späteren Phasen durch TanStack-Query-Hooks ergänzt (Bauplan §3).
 */
import type {
  TaskDto,
  TaskPriority,
  TaskRole,
  TaskStatus,
  ProjectSummaryDto,
  ProjectDetailDto,
  ProjectTaskDto,
  ProjectTaskPriority,
  ProjectMemberDto,
  CampaignSummaryDto,
  CampaignDetailDto,
  CampaignStatus,
  MeasureDto,
  MeasureType,
  DiscountDto,
  DiscountType,
  PlanMonthDto,
  PlanThemeDto,
  PlanLinkDto,
  PlanCategory,
  PlanLinkDirection,
  TimeEntryDto,
  TimeOverviewDto,
  AssetDto,
  AssetKind,
  UploadUrlDto,
  NewsDto,
  NotificationDto,
  AiChatMessage,
  AiChatResponse,
  SearchResultsDto,
} from '@g-hub/shared';

// Immer same-origin `/api`: lokal über den Vite-Proxy, in Produktion über den
// Proxy in `server.mjs`. So sind die Auth-Cookies first-party (funktioniert auch
// auf Mobile, wo Cross-Site-/Drittanbieter-Cookies blockiert werden). Eine evtl.
// veraltete VITE_API_URL wird bewusst ignoriert.
const BASE_URL = '/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (body?.message)
        message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    } catch {
      // kein JSON-Body
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path);
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
}

export function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined });
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });
}

export function apiDelete<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

// --- Health ---
export interface HealthResponse {
  status: string;
  version: string;
  db: string;
  time: string;
}

export function getHealth(): Promise<HealthResponse> {
  return apiGet<HealthResponse>('/health');
}

// --- Auth (Bauplan §5.1) ---
export interface Membership {
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
  role: string;
}

export interface AppearancePref {
  theme: string;
  accent: string;
  customAccent: string | null;
  corners: string;
  webLayout: string;
}

export interface Me {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  memberships: Membership[];
  appearance: AppearancePref | null;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  workspaceName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export function getMe(): Promise<Me> {
  return apiGet<Me>('/auth/me');
}

export function register(payload: RegisterPayload): Promise<Me> {
  return apiPost<Me>('/auth/register', payload);
}

export function login(payload: LoginPayload): Promise<Me> {
  return apiPost<Me>('/auth/login', payload);
}

export function logout(): Promise<{ status: string }> {
  return apiPost<{ status: string }>('/auth/logout');
}

/** Vollständige URL für den serverseitigen Google-Login-Start. */
export function googleConnectUrl(): string {
  return `${BASE_URL}/auth/google/connect`;
}

// --- Darstellung / Appearance (Bauplan §6.4) ---
/** Teil-Update der Darstellungs-Einstellungen; alle Felder optional. */
export type AppearanceUpdate = Partial<Omit<AppearancePref, 'customAccent'>> & {
  customAccent?: string | null;
};

export function getAppearance(): Promise<AppearancePref> {
  return apiGet<AppearancePref>('/me/appearance');
}

export function updateAppearance(patch: AppearanceUpdate): Promise<AppearancePref> {
  return apiPut<AppearancePref>('/me/appearance', patch);
}

// --- Aufgaben / Tasks (Bauplan §4.6 / §5.1) ---
export type { TaskDto, ChecklistItemDto, TaskAssigneeDto } from '@g-hub/shared';

export interface TaskFilters {
  assignee?: 'me';
  status?: TaskStatus;
  date?: string; // YYYY-MM-DD
}

export interface TaskInput {
  title: string;
  description?: string | null;
  projectText?: string | null;
  dueDate?: string | null;
  dueLabel?: string | null;
  time?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  role?: TaskRole;
  tag?: string | null;
  assigneeIds?: string[];
  checklist?: Array<{ title: string; done?: boolean }>;
}

export function listTasks(filters: TaskFilters = {}): Promise<TaskDto[]> {
  const qs = new URLSearchParams();
  if (filters.assignee) qs.set('assignee', filters.assignee);
  if (filters.status) qs.set('status', filters.status);
  if (filters.date) qs.set('date', filters.date);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiGet<TaskDto[]>(`/tasks${suffix}`);
}

export function getTask(id: string): Promise<TaskDto> {
  return apiGet<TaskDto>(`/tasks/${id}`);
}

export function createTask(input: TaskInput): Promise<TaskDto> {
  return apiPost<TaskDto>('/tasks', input);
}

export function updateTask(id: string, patch: Partial<TaskInput>): Promise<TaskDto> {
  return apiPatch<TaskDto>(`/tasks/${id}`, patch);
}

export function deleteTask(id: string): Promise<{ status: string }> {
  return apiDelete<{ status: string }>(`/tasks/${id}`);
}

// --- Projektmanager (Bauplan §4.5 / §5.1) ---
export type {
  ProjectSummaryDto,
  ProjectDetailDto,
  ProjectTaskDto,
  PhaseDto,
  ProjectMemberDto,
} from '@g-hub/shared';

export interface ProjectInput {
  name: string;
  kind?: string | null;
  dueDate?: string | null;
  dueLabel?: string | null;
  budgetText?: string | null;
  description?: string | null;
  leadId?: string;
  memberIds?: string[];
}

export interface ProjectTaskInput {
  title: string;
  description?: string | null;
  done?: boolean;
  dueDate?: string | null;
  dueLabel?: string | null;
  priority?: ProjectTaskPriority;
  memberIds?: string[];
  links?: string[];
}

export function listProjects(): Promise<ProjectSummaryDto[]> {
  return apiGet<ProjectSummaryDto[]>('/projects');
}

export function getProject(id: string): Promise<ProjectDetailDto> {
  return apiGet<ProjectDetailDto>(`/projects/${id}`);
}

export function listProjectMembers(): Promise<ProjectMemberDto[]> {
  return apiGet<ProjectMemberDto[]>('/projects/members');
}

export function createProject(input: ProjectInput): Promise<ProjectDetailDto> {
  return apiPost<ProjectDetailDto>('/projects', input);
}

export function updateProject(id: string, patch: Partial<ProjectInput>): Promise<ProjectDetailDto> {
  return apiPatch<ProjectDetailDto>(`/projects/${id}`, patch);
}

export function deleteProject(id: string): Promise<{ status: string }> {
  return apiDelete<{ status: string }>(`/projects/${id}`);
}

export function createPhase(projectId: string, name: string): Promise<ProjectDetailDto> {
  return apiPost<ProjectDetailDto>(`/projects/${projectId}/phases`, { name });
}

export function deletePhase(phaseId: string): Promise<ProjectDetailDto> {
  return apiDelete<ProjectDetailDto>(`/phases/${phaseId}`);
}

export function createProjectTask(
  phaseId: string,
  input: ProjectTaskInput,
): Promise<ProjectTaskDto> {
  return apiPost<ProjectTaskDto>(`/phases/${phaseId}/tasks`, input);
}

export function updateProjectTask(
  id: string,
  patch: Partial<ProjectTaskInput>,
): Promise<ProjectTaskDto> {
  return apiPatch<ProjectTaskDto>(`/project-tasks/${id}`, patch);
}

export function deleteProjectTask(id: string): Promise<{ status: string }> {
  return apiDelete<{ status: string }>(`/project-tasks/${id}`);
}

// --- Kampagnen (Bauplan §4.4 / §5.1) ---
export type {
  CampaignSummaryDto,
  CampaignDetailDto,
  MeasureDto,
  DiscountDto,
} from '@g-hub/shared';

export interface CampaignInput {
  name: string;
  status?: CampaignStatus;
  channels?: string[];
  budget?: number;
  spent?: number;
  reach?: number;
  kpiText?: string | null;
  zeitraum?: string | null;
  dueLabel?: string | null;
  color?: string | null;
}

export interface MeasureInput {
  name: string;
  type?: MeasureType;
  status?: CampaignStatus;
  progress?: number;
  postsCount?: number;
}

export interface DiscountInput {
  name: string;
  type?: DiscountType;
  value?: string | null;
  code?: string | null;
  zeitraum?: string | null;
  redeemed?: number;
  limit?: number;
}

export function listCampaigns(): Promise<CampaignSummaryDto[]> {
  return apiGet<CampaignSummaryDto[]>('/campaigns');
}

export function getCampaign(id: string): Promise<CampaignDetailDto> {
  return apiGet<CampaignDetailDto>(`/campaigns/${id}`);
}

export function createCampaign(input: CampaignInput): Promise<CampaignDetailDto> {
  return apiPost<CampaignDetailDto>('/campaigns', input);
}

export function updateCampaign(id: string, patch: Partial<CampaignInput>): Promise<CampaignDetailDto> {
  return apiPatch<CampaignDetailDto>(`/campaigns/${id}`, patch);
}

export function deleteCampaign(id: string): Promise<{ status: string }> {
  return apiDelete<{ status: string }>(`/campaigns/${id}`);
}

export function createMeasure(campaignId: string, input: MeasureInput): Promise<CampaignDetailDto> {
  return apiPost<CampaignDetailDto>(`/campaigns/${campaignId}/measures`, input);
}

export function updateMeasure(id: string, patch: Partial<MeasureInput>): Promise<MeasureDto> {
  return apiPatch<MeasureDto>(`/measures/${id}`, patch);
}

export function deleteMeasure(id: string): Promise<{ status: string }> {
  return apiDelete<{ status: string }>(`/measures/${id}`);
}

export function createDiscount(measureId: string, input: DiscountInput): Promise<MeasureDto> {
  return apiPost<MeasureDto>(`/measures/${measureId}/discounts`, input);
}

export function updateDiscount(id: string, patch: Partial<DiscountInput>): Promise<DiscountDto> {
  return apiPatch<DiscountDto>(`/discounts/${id}`, patch);
}

export function deleteDiscount(id: string): Promise<{ status: string }> {
  return apiDelete<{ status: string }>(`/discounts/${id}`);
}

// --- Jahresplan (Bauplan §4.8 / §5.1) ---
export type { PlanMonthDto, PlanThemeDto, PlanLinkDto } from '@g-hub/shared';

export interface PlanThemeInput {
  title: string;
  description?: string | null;
  category?: PlanCategory;
  channels?: string[];
}

export interface PlanLinkInput {
  direction: PlanLinkDirection;
  targetMonth: string;
  text: string;
}

export function getPlanYear(year: number): Promise<PlanMonthDto[]> {
  return apiGet<PlanMonthDto[]>(`/plan/${year}`);
}

export function seedPlanYear(year: number): Promise<PlanMonthDto[]> {
  return apiPost<PlanMonthDto[]>(`/plan/${year}/seed`);
}

export function updatePlanMonth(year: number, month: number, focus: string | null): Promise<PlanMonthDto> {
  return apiPatch<PlanMonthDto>(`/plan/${year}/months/${month}`, { focus });
}

export function createPlanTheme(year: number, month: number, input: PlanThemeInput): Promise<PlanMonthDto> {
  return apiPost<PlanMonthDto>(`/plan/${year}/months/${month}/themes`, input);
}

export function updatePlanTheme(id: string, patch: Partial<PlanThemeInput>): Promise<PlanThemeDto> {
  return apiPatch<PlanThemeDto>(`/plan-themes/${id}`, patch);
}

export function deletePlanTheme(id: string): Promise<{ status: string }> {
  return apiDelete<{ status: string }>(`/plan-themes/${id}`);
}

export function createPlanLink(year: number, month: number, input: PlanLinkInput): Promise<PlanMonthDto> {
  return apiPost<PlanMonthDto>(`/plan/${year}/months/${month}/links`, input);
}

export function updatePlanLink(id: string, patch: Partial<PlanLinkInput>): Promise<PlanLinkDto> {
  return apiPatch<PlanLinkDto>(`/plan-links/${id}`, patch);
}

export function deletePlanLink(id: string): Promise<{ status: string }> {
  return apiDelete<{ status: string }>(`/plan-links/${id}`);
}

// --- Zeiterfassung (Bauplan §4.11 / §5.1) ---
export type { TimeEntryDto, TimeOverviewDto } from '@g-hub/shared';

export function getTimeToday(): Promise<TimeEntryDto | null> {
  return apiGet<TimeEntryDto | null>('/time/today');
}

export function getTimeMonth(): Promise<TimeOverviewDto> {
  return apiGet<TimeOverviewDto>('/time/month');
}

export function timeClockIn(): Promise<TimeEntryDto> {
  return apiPost<TimeEntryDto>('/time/clock-in');
}

export function timeClockOut(): Promise<TimeEntryDto> {
  return apiPost<TimeEntryDto>('/time/clock-out');
}

export function timeBreakStart(): Promise<TimeEntryDto> {
  return apiPost<TimeEntryDto>('/time/break/start');
}

export function timeBreakEnd(): Promise<TimeEntryDto> {
  return apiPost<TimeEntryDto>('/time/break/end');
}

// --- Assets (Bauplan §4.7 / §5.1) ---
export type { AssetDto, AssetKind, UploadUrlDto } from '@g-hub/shared';

export function getAssets(kind?: AssetKind): Promise<AssetDto[]> {
  const qs = kind ? `?kind=${encodeURIComponent(kind)}` : '';
  return apiGet<AssetDto[]>(`/assets${qs}`);
}

export function getAsset(id: string): Promise<AssetDto> {
  return apiGet<AssetDto>(`/assets/${id}`);
}

export function requestAssetUploadUrl(input: {
  filename: string;
  mime: string;
  size: number;
}): Promise<UploadUrlDto> {
  return apiPost<UploadUrlDto>('/assets/upload-url', input);
}

export function createAsset(input: {
  tag: string;
  kind: AssetKind;
  mime: string;
  size: number;
  storageKey: string;
  channel?: string | null;
}): Promise<AssetDto> {
  return apiPost<AssetDto>('/assets', input);
}

export function deleteAsset(id: string): Promise<{ status: string }> {
  return apiDelete<{ status: string }>(`/assets/${id}`);
}

/** Leitet die Asset-Art aus dem MIME-Typ ab (Bild/Video/Datei). */
export function assetKindFromMime(mime: string): AssetKind {
  if (mime.startsWith('image/')) return 'Bild';
  if (mime.startsWith('video/')) return 'Video';
  return 'Datei';
}

/**
 * Lädt eine Datei direkt per presigned PUT in den Bucket (ohne Cookies/Credentials).
 * Der Content-Type muss zu dem beim Signieren verwendeten passen.
 */
async function uploadToBucket(uploadUrl: string, file: File): Promise<void> {
  const contentType = file.type || 'application/octet-stream';
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  });
  if (!res.ok) throw new ApiError(res.status, `Upload fehlgeschlagen (${res.status}).`);
}

/** Kompletter Upload-Flow: URL anfordern → PUT in den Bucket → Metadaten anlegen. */
export async function uploadAsset(file: File, channel?: string | null): Promise<AssetDto> {
  const mime = file.type || 'application/octet-stream';
  const { storageKey, uploadUrl } = await requestAssetUploadUrl({
    filename: file.name,
    mime,
    size: file.size,
  });
  await uploadToBucket(uploadUrl, file);
  return createAsset({
    tag: file.name,
    kind: assetKindFromMime(file.type),
    mime,
    size: file.size,
    storageKey,
    channel: channel ?? null,
  });
}

// --- Branchen-News & Trends ---
export type { NewsDto, NewsCategory } from '@g-hub/shared';

/** News des Workspace (neueste zuerst; Backend befüllt beim ersten Abruf). */
export function listNews(): Promise<NewsDto[]> {
  return apiGet<NewsDto[]>('/news');
}

/** Einen News-Beitrag als gelesen markieren. */
export function markNewsRead(id: string): Promise<NewsDto> {
  return apiPatch<NewsDto>(`/news/${id}/read`);
}

/** Alle News-Beiträge als gelesen markieren. */
export function markAllNewsRead(): Promise<{ status: string }> {
  return apiPost<{ status: string }>('/news/read-all');
}

// --- Mitteilungen / Inbox ---
export type { NotificationDto, NotificationType } from '@g-hub/shared';

/** Mitteilungen des Workspace (neueste zuerst; Backend befüllt beim ersten Abruf). */
export function listNotifications(): Promise<NotificationDto[]> {
  return apiGet<NotificationDto[]>('/notifications');
}

/** Eine Mitteilung als gelesen markieren. */
export function markNotificationRead(id: string): Promise<NotificationDto> {
  return apiPatch<NotificationDto>(`/notifications/${id}/read`);
}

/** Alle Mitteilungen als gelesen markieren. */
export function markAllNotificationsRead(): Promise<{ status: string }> {
  return apiPost<{ status: string }>('/notifications/read-all');
}

// --- KI-Assistent (Claude/Anthropic über Backend-Proxy) ---
export type { AiChatMessage, AiChatResponse } from '@g-hub/shared';

/** Schickt den Gesprächsverlauf an den Backend-Proxy → Anthropic. */
export function aiChat(messages: AiChatMessage[]): Promise<AiChatResponse> {
  return apiPost<AiChatResponse>('/ai/chat', { messages });
}

// --- Globale Suche (Bauplan §5.1 / §7) ---
export type { SearchHitDto, SearchResultsDto } from '@g-hub/shared';

export function searchAll(q: string): Promise<SearchResultsDto> {
  return apiGet<SearchResultsDto>(`/search?q=${encodeURIComponent(q)}`);
}
