import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'
import { readServerEnv } from '@/shared/env'
import { sessionCookieOptions } from './cookie-options'

type CookieStore = {
  getAll(): { name: string; value: string }[]
  set(cookie: { name: string; value: string } & Record<string, unknown>): void
}

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> }

/**
 * Adaptador de cookies en la interfaz de LOTE (getAll/setAll). Portado de TurnoGol después
 * del bug de producción del 2026-09-04: con la interfaz vieja quedaban fragmentos
 * `sb-…-auth-token.N` huérfanos que corrompían la sesión.
 *
 * El try envuelve el lote entero: si la primera escritura falla no se escribe ninguna y la
 * sesión anterior queda intacta. Falla siempre en Server Components (no pueden escribir
 * cookies); por eso el refresco de sesión vive en el proxy (./proxy.ts).
 */
export function cookieAdapter(store: CookieStore) {
  return {
    getAll(): { name: string; value: string }[] {
      return store.getAll()
    },
    setAll(cookiesToSet: CookieToSet[]): void {
      try {
        for (const { name, value, options } of cookiesToSet) {
          store.set({ name, value, ...options })
        }
      } catch {
        // Server Component: el proxy ya refrescó la sesión antes de llegar acá.
      }
    },
  }
}

export async function createSupabaseServerClient(): Promise<SupabaseClient> {
  const env = readServerEnv()
  const cookieStore = await cookies()
  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: cookieAdapter(cookieStore),
      cookieOptions: sessionCookieOptions(),
    },
  )
}
