'use server'

import { signOutLocal } from '@/modules/auth/auth.service'
import { authorizeUserAction } from '@/server/guards'

export async function signOutAction(): Promise<{ path: string }> {
  const auth = await authorizeUserAction()
  if (auth.ok) await signOutLocal()
  return { path: '/ingresar' }
}
