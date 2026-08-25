/** Production canonical origin (Azure SWA custom domain). */
export const PROD_PUBLIC_ORIGIN = 'https://jsonmais.solucaosimples.com.br'

export function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, '')
}

export function resolvePublicOrigin(
  envOrigin: string | undefined,
  fallback = PROD_PUBLIC_ORIGIN,
): string {
  const raw = envOrigin?.trim()
  if (!raw) return fallback
  return normalizeOrigin(raw)
}

/**
 * Indexable when VITE_SEO_INDEX=true, or when unset and origin matches production.
 * Staging/preview should set VITE_SEO_INDEX=false.
 */
export function resolveSeoIndexable(
  seoIndex: string | undefined,
  origin: string,
): boolean {
  const flag = seoIndex?.trim().toLowerCase()
  if (flag === 'true' || flag === '1') return true
  if (flag === 'false' || flag === '0') return false
  return normalizeOrigin(origin) === PROD_PUBLIC_ORIGIN
}

/** Absolute canonical URL: no trailing slash except home. */
export function canonicalUrl(origin: string, path: string): string {
  const base = normalizeOrigin(origin)
  if (!path || path === '/') return `${base}/`
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized.replace(/\/+$/, '')}`
}
