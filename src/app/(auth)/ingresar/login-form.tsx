'use client'

import { useActionState, useEffect } from 'react'
import { Field, SubmitButton } from '@/components/field'
import { FormMessage } from '@/components/form-message'
import { loginAction, type LoginState } from './actions'

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {
    status: 'idle',
  })
  useEffect(() => {
    if (state.status === 'success') window.location.assign(state.path)
  }, [state])
  return (
    <form action={action} className="flex flex-col gap-4">
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.status === 'error' ? state.email : ''}
      />
      <Field
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      <FormMessage message={state.status === 'error' ? state.message : null} />
      <SubmitButton pending={pending}>Ingresar</SubmitButton>
    </form>
  )
}
