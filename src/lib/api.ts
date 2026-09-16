const STORAGE_KEY = 'mandela_matrix_api_base_url';
const ANDROID_LOCAL_BACKEND = 'http://127.0.0.1:3000';

function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, '');
}

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) return normalizeBaseUrl(saved);
    if (window.location.hostname === 'appassets.androidplatform.net') return ANDROID_LOCAL_BACKEND;
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

let termuxStartAttempted = false;
let termuxStartPromise: Promise<boolean> | null = null;

async function backendReady(): Promise<boolean> {
  try {
    const response = await fetch(`${ANDROID_LOCAL_BACKEND}/api/health`, { method: 'GET', cache: 'no-store' });
    if (!response.ok) return false;
    const data = await response.json().catch(() => ({}));
    return data.status === 'online';
  } catch {
    return false;
  }
}

async function tryStartTermuxBackend() {
  if (termuxStartAttempted || typeof window === 'undefined') return false;
  termuxStartAttempted = true;
  const native = (window as any).MatrixNative;
  if (!native || typeof native.isInstalled !== 'function' || typeof native.startBackend !== 'function') return false;
  try {
    if (!native.isInstalled()) return false;
    if (termuxStartPromise) return termuxStartPromise;
    termuxStartPromise = (async () => {
      if (await backendReady()) return true;
      if (!Boolean(native.startBackend())) return false;
      for (let attempt = 0; attempt < 30; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (await backendReady()) return true;
      }
      return false;
    })();
    return await termuxStartPromise;
  } catch {
    return false;
  }
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = apiUrl(path);
  try {
    return await fetch(url, init);
  } catch (firstError) {
    const isAndroid = typeof window !== 'undefined' && window.location.hostname === 'appassets.androidplatform.net';
    const isLocal = url.startsWith(ANDROID_LOCAL_BACKEND);
    if (!isAndroid || !isLocal) throw firstError;
    const started = await tryStartTermuxBackend();
    if (!started) {
      throw new Error(`Local Termux build backend did not become ready at ${ANDROID_LOCAL_BACKEND}. Install Termux, enable its external-command permission, and ensure Node.js/npm are installed.`);
    }
    return fetch(url, init);
  }
}

export async function checkBackend(): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    const response = await apiFetch('/api/health', { method: 'GET', cache: 'no-store' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, error: data.error || `HTTP ${response.status}` };
    return { ok: data.status === 'online', data };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
