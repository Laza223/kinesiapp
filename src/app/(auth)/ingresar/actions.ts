'use server'

import { signInWithPassword } from '@/modules/auth/auth.service'
import { credentialsSchema } from '@/modules/auth/auth.schema'
import { getAuthUser } from '@/modules/auth/session'
import { homePathFor } from '@/modules/membership/access'
import { listMyMemberships } from '@/modules/membership/membership.service'

export type LoginState =
  | { status: 'idle' }
  | { status: 'error'; message: string; email: string }
  | { status: 'success'; path: string }

const GENERIC = 'Email o contraseña incorrectos.'

// Acción pública (es el login): no lleva guard; está en la allowlist de guard-chain.test.ts.
// No redirige desde el servidor: devuelve la ruta y el cliente hace una navegación completa,
// así el navegador ya aplicó la cookie (carrera de WebKit medida en TurnoGol).
export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '')
  const parsed = credentialsSchema.safeParse({ email, password: formData.get('password') })
  if (!parsed.success) return { status: 'error', message: GENERIC, email }

  const result = await signInWithPassword(parsed.data.email, parsed.data.password)
  if (!result.ok) {
    const message =
      result.code === 'email_not_confirmed'
        ? 'Tenés que confirmar tu email antes de entrar. Revisá tu casilla.'
        : GENERIC
    return { status: 'error', message, email }
  }
  const user = await getAuthUser()
  if (!user) return { status: 'success', path: '/' }
  return { status: 'success', path: homePathFor(await listMyMemberships(user.userId)) }
}
