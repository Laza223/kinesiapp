import { cache } from 'react'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export type AuthUser = { userId: string; email: string | null }

/**
 * Usuario autenticado del request, o null. `getUser()` valida contra GoTrue (ve sesiones
 * revocadas); nunca `getSession()` en el servidor, que solo lee la cookie sin validarla.
 * La identidad sale únicamente del `sub`: roles y consultorios se leen de la base.
 */
export const getAuthUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  return { userId: data.user.id, email: data.user.email ?? null }
})
