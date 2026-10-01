const DEFAULT_ALLOWED_CROSS_ORIGINS = ['https://appassets.androidplatform.net'];

export function parseAllowedOrigins(raw: string | undefined): string[] {
  const configured = (raw || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return [...new Set([...DEFAULT_ALLOWED_CROSS_ORIGINS, ...configured])];
}

export interface CorsDecision {
  allowOrigin?: string;
  reject: boolean;
}

export function getCorsDecision(
  requestOrigin: string | undefined,
  sameOrigin: string | undefined,
  allowedOrigins: string[],
): CorsDecision {
  if (!requestOrigin) return { reject: false };
  if (sameOrigin && requestOrigin === sameOrigin) return { allowOrigin: requestOrigin, reject: false };
  if (allowedOrigins.includes('*')) return { allowOrigin: '*', reject: false };
  if (allowedOrigins.includes(requestOrigin)) return { allowOrigin: requestOrigin, reject: false };
  return { reject: true };
}
