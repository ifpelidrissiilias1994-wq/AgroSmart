/**
 * api.ts — HTTP client for the Flask backend.
 * All /api/* requests are proxied to Flask via Vite dev server.
 */

export class ApiError extends Error {
  status: number;
  code: string;
  detail: string;

  constructor(status: number, code: string, detail: string) {
    super(detail);
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}

async function apiFetch<T = unknown>(url: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(opts.headers as Record<string, string> || {}),
  };

  if (opts.body && typeof opts.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, { ...opts, headers, credentials: 'same-origin' });

  if (res.status === 204 || res.status === 304) return null as T;

  if (res.status === 401) {
    // Let auth context handle this
    throw new ApiError(401, 'auth_required', 'Sesión expirada.');
  }

  if (!res.ok) {
    let code = 'error';
    let detail = res.statusText;
    try {
      const body = await res.json();
      code = body.error || code;
      detail = body.detail || body.message || detail;
    } catch (_e) { /* ignore parse errors */ }
    throw new ApiError(res.status, code, detail);
  }

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return null as T;
}

async function apiFetchBlob(url: string, opts: RequestInit = {}): Promise<Blob> {
  const res = await fetch(url, { ...opts, credentials: 'same-origin' });
  if (!res.ok) {
    throw new ApiError(res.status, 'download_error', 'Error al descargar.');
  }
  return res.blob();
}

// ─── Auth ───────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  data_policy_accepted_at?: string | null;
}

export const authApi = {
  me: () => apiFetch<User>('/api/auth/me'),
  login: (identifier: string, password: string) =>
    apiFetch<User>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),
  register: (data: { username: string; email: string; password: string; password2: string; accept_data_policy: boolean }) =>
    apiFetch<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  logout: () =>
    apiFetch('/api/auth/logout', { method: 'POST' }),
};

// ─── Parcels ────────────────────────────────────────────────────────────────
export interface Parcel {
  id: number;
  name: string;
  lat?: number;
  lon?: number;
  area_ha?: number;
  crop?: string;
  variety?: string;
  aemet_station_id?: string;
  transplant_date?: string;
  irrigation_system?: string;
  poly_id?: string;
  geometry?: unknown;
  irrigation_notes?: string;
}

export interface CropType { id: number; name: string; icon?: string }
export interface CropVariety { id: number; crop_type_id: number; name: string; kc_init?: number; kc_mid?: number; kc_end?: number }

export const parcelsApi = {
  list: (opts?: RequestInit) => apiFetch<Parcel[]>('/api/parcels', opts),
  get: (id: number) => apiFetch<Parcel>(`/api/parcels/${id}`),
  create: (payload: Record<string, unknown>) =>
    apiFetch<Parcel>('/api/parcels', { method: 'POST', body: JSON.stringify(payload) }),
  patch: (id: number, payload: Record<string, unknown>) =>
    apiFetch<Parcel>(`/api/parcels/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  delete: (id: number) =>
    apiFetch(`/api/parcels/${id}`, { method: 'DELETE' }),
  recalc: (id: number, opts?: { today?: boolean; backfill_days?: number }) =>
    apiFetch(`/api/parcels/${id}/recalc`, { method: 'POST', body: JSON.stringify(opts || {}) }),
  cropTypes: () => apiFetch<CropType[]>('/api/crop-types'),
  cropVarieties: (cropTypeId: number) => apiFetch<CropVariety[]>(`/api/crop-varieties?crop_type_id=${cropTypeId}`),
  soilPoints: (id: number, params?: Record<string, string>) =>
    apiFetch(`/api/parcels/${id}/soil_points${params ? '?' + new URLSearchParams(params) : ''}`),
  soilSummary: (id: number, params?: Record<string, string>) =>
    apiFetch(`/api/parcels/${id}/soil-summary${params ? '?' + new URLSearchParams(params) : ''}`),
  soilRefresh: (id: number, payload: Record<string, unknown>) =>
    apiFetch(`/api/parcels/${id}/soil-refresh`, { method: 'POST', body: JSON.stringify(payload) }),
  airQuality: (id: number) => apiFetch(`/api/parcels/${id}/air_quality`),
  environmentExport: (id: number) => apiFetchBlob(`/api/parcels/${id}/environment/export.xlsx`),
};

// ─── Cadastre ───────────────────────────────────────────────────────────────
export const cadastreApi = {
  lookup: (rc: string) => apiFetch(`/api/cadastre/parcel?rc=${encodeURIComponent(rc)}`),
  byLocation: (lat: number, lon: number, meters?: number) =>
    apiFetch(`/api/cadastre/parcel/by_location?lat=${lat}&lon=${lon}${meters ? `&meters=${meters}` : ''}`),
};

// ─── Daily ──────────────────────────────────────────────────────────────────
export interface DailyMetrics {
  et0?: number; etc_mm?: number; vpd_kpa?: number;
  ndvi?: number; precip?: number; tmin?: number; tmax?: number;
  balance_mm?: number; deficit_week_mm?: number;
  states?: Array<{ sem: string; level: string; message: string }>;
  messages?: string[];
  [key: string]: unknown;
}

export const dailyApi = {
  today: (id: number, opts?: Record<string, string>) =>
    apiFetch<DailyMetrics>(`/api/daily/${id}/today${opts ? '?' + new URLSearchParams(opts) : ''}`),
  latest: (id: number) => apiFetch<DailyMetrics>(`/api/daily/${id}/latest`),
  summary: (id: number, days = 30) =>
    apiFetch(`/api/daily/${id}/summary?days=${days}`),
  panel: (id: number, date?: string) =>
    apiFetch(`/api/daily/${id}/panel${date ? '?date=' + date : ''}`),
};

// ─── Actions ────────────────────────────────────────────────────────────────
export interface Action {
  id: number;
  parcel_id: number;
  type: string;
  action_at: string;
  qty_value?: number;
  qty_unit?: string;
  product?: string;
  active_ingredient?: string;
  method?: string;
  note?: string;
  data_json?: unknown;
  cost_per_ha?: number;
}

export const actionsApi = {
  list: (parcelId: number, params?: Record<string, string>) =>
    apiFetch<Action[]>(`/api/parcels/${parcelId}/actions${params ? '?' + new URLSearchParams(params) : ''}`),
  create: (parcelId: number, payload: Record<string, unknown>) =>
    apiFetch<Action>(`/api/parcels/${parcelId}/actions`, { method: 'POST', body: JSON.stringify(payload) }),
  update: (parcelId: number, actionId: number, payload: Record<string, unknown>) =>
    apiFetch<Action>(`/api/parcels/${parcelId}/actions/${actionId}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  delete: (parcelId: number, actionId: number) =>
    apiFetch(`/api/parcels/${parcelId}/actions/${actionId}`, { method: 'DELETE' }),
};

// ─── History ────────────────────────────────────────────────────────────────
export const historyApi = {
  series: (params: Record<string, string>) =>
    apiFetch(`/api/history/series?${new URLSearchParams(params)}`),
  exportXlsx: (params: Record<string, string>) =>
    apiFetchBlob(`/api/history/export.xlsx?${new URLSearchParams(params)}`),
};

// ─── Alerts ─────────────────────────────────────────────────────────────────
export interface Alert {
  id: number;
  parcel_id: number;
  level: string;
  topic: string;
  code: string;
  message: string;
  created_at: string;
  closed_at?: string;
}

export const alertsApi = {
  list: (params?: Record<string, string>) =>
    apiFetch<{ alerts: Alert[] }>(`/api/alerts${params ? '?' + new URLSearchParams(params) : ''}`),
  get: (id: number) => apiFetch<Alert>(`/api/alerts/${id}`),
  close: (id: number) => apiFetch<Alert>(`/api/alerts/${id}/close`, { method: 'POST' }),
};

// ─── Users ──────────────────────────────────────────────────────────────────
export const usersApi = {
  settings: () => apiFetch<{ ui_mode: string }>('/api/users/me/settings'),
  saveSettings: (payload: { ui_mode: string }) =>
    apiFetch('/api/users/me/settings', { method: 'PUT', body: JSON.stringify(payload) }),
  updateProfile: (payload: { username?: string; email?: string }) =>
    apiFetch('/api/users/me/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  changePassword: (old_password: string, new_password: string) =>
    apiFetch('/api/users/me/change-password', { method: 'POST', body: JSON.stringify({ old_password, new_password }) }),
  acceptDataPolicy: () =>
    apiFetch('/api/users/me/accept-data-policy', { method: 'POST' }),
  deleteAccount: (password: string) =>
    apiFetch('/api/users/me/delete', { method: 'POST', body: JSON.stringify({ password }) }),
};
