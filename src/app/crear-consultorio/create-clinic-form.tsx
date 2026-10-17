'use client'

import { useActionState, useEffect } from 'react'
import { Field, SubmitButton } from '@/components/field'
import { FormMessage } from '@/components/form-message'
import { createClinicAction, type CreateClinicState } from './actions'

export function CreateClinicForm() {
  const [state, action, pending] = useActionState<CreateClinicState, FormData>(createClinicAction, {
    status: 'idle',
  })
  useEffect(() => {
    if (state.status === 'success') window.location.assign(state.path)
  }, [state])
  return (
    <form action={action} className="flex flex-col gap-4">
      <Field
        label="Nombre del consultorio"
        name="name"
        required
        defaultValue={state.status === 'error' ? state.name : ''}
      />
      <FormMessage message={state.status === 'error' ? state.message : null} />
      <SubmitButton pending={pending}>Crear consultorio</SubmitButton>
    </form>
  )
}
