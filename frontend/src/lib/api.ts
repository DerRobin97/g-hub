/**
 * Minimaler API-Client. Basis-URL aus VITE_API_URL (Default: /api via Vite-Proxy).
 * Wird in späteren Phasen durch TanStack-Query-Hooks ergänzt (Bauplan §3).
 */
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

export interface HealthResponse {
  status: string;
  version: string;
  db: string;
  time: string;
}

export function getHealth(): Promise<HealthResponse> {
  return apiGet<HealthResponse>('/health');
}
