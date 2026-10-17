import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { sessionCookieOptions } from './cookie-options'

const WARN_COOLDOWN_MS = 60_000
let lastWarnAt = 0

function warnRefreshFailure(err: unknown): void {
  const now = Date.now()
  if (now - lastWarnAt < WARN_COOLDOWN_MS) return
  lastWarnAt = now
  // Solo el tipo de error: nunca tokens ni cookies.
  console.warn('[proxy] refresco de sesión falló', err instanceof Error ? err.name : typeof err)
}

/**
 * Renueva el par access/refresh de Supabase y propaga las cookies nuevas. Portado de TurnoGol
 * (`src/lib/supabase/middleware.ts`, decisión 2026-09-04): con rotación de refresh tokens, una
 * renovación que no se persiste mata la sesión para siempre, y los Server Components no
 * pueden escribir cookies. El proxy es el único lugar que puede.
 *
 * Qué NO hace: no autoriza, no lee roles, no redirige. Falla abierto: si GoTrue no responde,
 * la request sigue y el guard de la página decide como siempre.
 */
export async function refreshSessionCookies(
  req: NextRequest,
  requestHeaders: Headers,
): Promise<NextResponse> {
  let res = NextResponse.next({ request: { headers: requestHeaders } })

  // Interruptor de emergencia: apaga solo el refresco, sin recompilar.
  if (process.env.SESSION_REFRESH_DISABLED === '1') return res
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) return res

  const supabase = createServerClient(url, key, {
    cookieOptions: sessionCookieOptions(),
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        // 1. Mutar el REQUEST, para que la página de abajo lea la sesión nueva. Los valores
        //    vacíos se BORRAN: un fragmento vacío se concatena igual y corrompe la credencial.
        for (const { name, value } of cookiesToSet) {
          if (value === '') req.cookies.delete(name)
          else req.cookies.set(name, value)
        }
        requestHeaders.set(
          'cookie',
          req.cookies
            .getAll()
            .map((c) => `${c.name}=${c.value}`)
            .join('; '),
        )
        res = NextResponse.next({ request: { headers: requestHeaders } })
        // 2. Set-Cookie al navegador (maxAge 0 en los fragmentos sobrantes: ahí se podan).
        for (const { name, value, options } of cookiesToSet) {
          res.cookies.set(name, value, options)
        }
        // 3. Headers de caché que manda la librería (no-store) para que ningún CDN guarde
        //    una respuesta con la sesión de otro. TurnoGol los ignoraba.
        for (const [header, value] of Object.entries(headers)) {
          res.headers.set(header, value)
        }
      },
    },
  })

  try {
    await supabase.auth.getClaims()
  } catch (err) {
    warnRefreshFailure(err)
  }
  return res
}
