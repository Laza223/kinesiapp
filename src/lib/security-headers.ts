/**
 * Headers de seguridad. La CSP lleva un nonce por request (la arma `src/proxy.ts`), así que
 * todas las páginas se renderizan dinámicamente: en una app con sesión eso ya era así.
 * `'strict-dynamic'` + nonce reemplaza al `'unsafe-inline'` que tenía TurnoGol: un XSS no
 * puede ejecutar scripts inyectados, que en un producto con historias clínicas es la
 * diferencia entre un bug y una filtración.
 * Estilos: `'unsafe-inline'` en style-src porque React escribe atributos `style`; el riesgo de
 * inyección de estilos es mucho menor que el de scripts.
 */
export function buildCsp(nonce: string, isDev: boolean): string {
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    `connect-src 'self'${isDev ? ' ws:' : ''}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ]
  return directives.join('; ')
}

/** Headers fijos (no dependen del request): los aplica next.config.ts a todas las rutas. */
export const STATIC_SECURITY_HEADERS: ReadonlyArray<{ key: string; value: string }> = [
  // Sin `preload` hasta tener dominio definitivo.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  // La app no se indexa: no hay páginas públicas todavía.
  { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
]
