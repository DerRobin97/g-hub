/**
 * Minimaler API-Client. Basis-URL aus VITE_API_URL (Default: /api via Vite-Proxy).
 * Wird in späteren Phasen durch TanStack-Query-Hooks ergänzt (Bauplan §3).
 */
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

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
