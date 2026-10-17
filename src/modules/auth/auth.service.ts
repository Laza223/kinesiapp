import { createSupabaseServerClient } from '@/lib/supabase/server'

type SignInResult =
  { ok: true } | { ok: false; code: 'invalid_credentials' | 'email_not_confirmed' }

export async function signInWithPassword(email: string, password: string): Promise<SignInResult> {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (!error) return { ok: true }
  // Respuesta genérica salvo el caso que el usuario puede resolver solo.
  return {
    ok: false,
    code: error.code === 'email_not_confirmed' ? 'email_not_confirmed' : 'invalid_credentials',
  }
}

type SignUpResult = { ok: true } | { ok: false; code: 'weak_password' | 'unavailable' }

export async function signUpStaff(
  email: string,
  password: string,
  origin: string,
): Promise<SignUpResult> {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/confirmar` },
  })
  if (!error) return { ok: true }
  // weak_password incluye contraseñas filtradas (HIBP): TurnoGol mostraba un error genérico.
  return { ok: false, code: error.code === 'weak_password' ? 'weak_password' : 'unavailable' }
}

export async function signOutLocal(): Promise<void> {
  const supabase = await createSupabaseServerClient()
  // `local`: cierra solo este dispositivo.
  await supabase.auth.signOut({ scope: 'local' })
}
