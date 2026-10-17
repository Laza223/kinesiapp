/**
 * Opciones de las cookies de sesión. Diferencias deliberadas con el default de @supabase/ssr:
 *   - maxAge 12 h (no 400 días): las PCs de recepción son compartidas; la sesión no
 *     sobrevive a la noche. Se revisa con los pilotos (docs/architecture.md).
 *   - httpOnly: no hay cliente de Supabase en el navegador, así que JS no necesita leerlas.
 */
export const SESSION_MAX_AGE_SECONDS = 12 * 60 * 60

export function sessionCookieOptions() {
  return {
    maxAge: SESSION_MAX_AGE_SECONDS,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  }
}
