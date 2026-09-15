const STORAGE_KEY = 'mandela_matrix_api_base_url';
const ANDROID_LOCAL_BACKEND = 'http://127.0.0.1:3000';

function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, '');
}

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) return normalizeBaseUrl(saved);

    if (window.location.hostname === 'appassets.androidplatform.net') {
      return ANDROID_LOCAL_BACKEND;
    }
  }

  const configured = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return normalizeBaseUrl(configured || '');
}

export function setApiBaseUrl(value: string) {
  const normalized = normalizeBaseUrl(value);
  if (typeof window !== 'undefined') {
    if (normalized) window.localStorage.setItem(STORAGE_KEY, normalized);
    else window.localStorage.removeItem(STORAGE_KEY);
  }
  return normalized;
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${normalizedPath}` : normalizedPath;
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), init);
}

export async function checkBackend(): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    const response = await apiFetch('/api/health', { method: 'GET' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, error: data.error || `HTTP ${response.status}` };
    return { ok: data.status === 'online', data };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
