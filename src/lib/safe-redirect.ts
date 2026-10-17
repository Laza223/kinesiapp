/**
 * Devuelve `next` solo si es una ruta del mismo origen (empieza con una sola `/`). Portado de
 * TurnoGol: quita TAB/LF/CR antes de chequear porque el navegador los elimina al parsear la
 * URL (`/\t/evil.com` → `//evil.com`), y acepta `unknown` porque `?next=a&next=b` llega como
 * array.
 */
export function sanitizeNext(next: unknown, fallback = '/'): string {
  if (typeof next !== 'string' || !next) return fallback
  const stripped = next.replace(/[\t\n\r]/g, '')
  if (!stripped.startsWith('/')) return fallback
  if (stripped.startsWith('//')) return fallback
  if (stripped.startsWith('/\\')) return fallback
  return stripped
}
