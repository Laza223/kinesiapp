'use client'

import { useActionState } from 'react'
import { Field, SubmitButton } from '@/components/field'
import { FormMessage } from '@/components/form-message'
import { MIN_PASSWORD_LENGTH } from '@/modules/auth/auth.schema'
import { signupAction, type SignupState } from './actions'

export function SignupForm() {
  const [state, action, pending] = useActionState<SignupState, FormData>(signupAction, {
    status: 'idle',
  })
  if (state.status === 'sent') {
    return (
      <p role="status" className="text-sm">
        Te mandamos un email a <strong>{state.email}</strong> para confirmar la cuenta.
      </p>
    )
  }
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
        label={`Contraseña (mínimo ${MIN_PASSWORD_LENGTH} caracteres)`}
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={MIN_PASSWORD_LENGTH}
        required
      />
      <FormMessage message={state.status === 'error' ? state.message : null} />
      <SubmitButton pending={pending}>Crear cuenta</SubmitButton>
    </form>
  )
}
