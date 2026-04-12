export const MONITORING_URL: string =
  (import.meta.env.VITE_MONITORING_URL as string | undefined) ?? ''

export const AI_ORCHESTRATOR_URL: string =
  (import.meta.env.VITE_AI_ORCHESTRATOR_URL as string | undefined) ?? ''

export const AUTH_SERVICE_URL: string =
  (import.meta.env.VITE_AUTH_SERVICE_URL as string | undefined) ?? ''

export const PROJECTS_API_BASE_URL: string =
  ((import.meta.env.VITE_PROJECTS_API_BASE_URL as string | undefined) ?? '').replace(/\/$/, '')

const _ADMIN_JWT_ENV = (import.meta.env.VITE_ADMIN_JWT as string | undefined) ?? ''

/**
 * Resolves the admin bearer token.
 * Prefers VITE_ADMIN_JWT (build-time env var); falls back to the OAuth
 * portal_token stored in localStorage by AuthContext after a successful login.
 */
export function resolveAdminToken(): string {
  if (_ADMIN_JWT_ENV) return _ADMIN_JWT_ENV
  try { return localStorage.getItem('portal_token') ?? '' } catch { return '' }
}
