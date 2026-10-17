'use server'

import { signUpStaff } from '@/modules/auth/auth.service'
import { credentialsSchema, MIN_PASSWORD_LENGTH } from '@/modules/auth/auth.schema'
import { getRequestOrigin } from '@/server/request-context'

export type SignupState =
  | { status: 'idle' }
  | { status: 'error'; message: string; email: string }
  | { status: 'sent'; email: string }

// Acción pública (es el alta): no lleva guard; está en la allowlist de guard-chain.test.ts.
export async function signupAction(_prev: SignupState, formData: FormData): Promise<SignupState> {
  const email = String(formData.get('email') ?? '')
  const parsed = credentialsSchema.safeParse({ email, password: formData.get('password') })
  if (!parsed.success) {
    return {
      status: 'error',
      message: `Revisá el email y usá una contraseña de al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
      email,
    }
  }
  const result = await signUpStaff(
    parsed.data.email,
    parsed.data.password,
    await getRequestOrigin(),
  )
  if (!result.ok) {
    const message =
      result.code === 'weak_password'
        ? 'Esa contraseña es débil o apareció en filtraciones conocidas. Elegí otra.'
        : 'No pudimos crear la cuenta. Probá de nuevo en unos minutos.'
    return { status: 'error', message, email }
  }
  // Mismo mensaje exista o no la cuenta: no revela qué emails están registrados.
  return { status: 'sent', email: parsed.data.email }
}
