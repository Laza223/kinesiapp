'use client'

import { useTransition } from 'react'
import { signOutAction } from './actions'

export function SignOutButton() {
  const [pending, startTransition] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      className="text-sm underline"
      onClick={() =>
        startTransition(async () => {
          const { path } = await signOutAction()
          window.location.assign(path)
        })
      }
    >
      Cerrar sesión
    </button>
  )
}
