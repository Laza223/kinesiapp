'use server'

import { createClinic } from '@/modules/clinics/clinics.service'
import { clinicNameSchema } from '@/modules/clinics/clinics.schema'
import { authorizeUserAction } from '@/server/guards'
import { getRequestId } from '@/server/request-context'
import { logError } from '@/shared/observability/log-error'

export type CreateClinicState =
  | { status: 'idle' }
  | { status: 'error'; message: string; name: string }
  | { status: 'success'; path: string }

export async function createClinicAction(
  _prev: CreateClinicState,
  formData: FormData,
): Promise<CreateClinicState> {
  const name = String(formData.get('name') ?? '')
  const auth = await authorizeUserAction()
  if (!auth.ok) return { status: 'error', message: auth.message, name }

  const parsed = clinicNameSchema.safeParse(name)
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Nombre inválido.', name }
  }
  const requestId = await getRequestId()
  try {
    const result = await createClinic({ userId: auth.user.userId, name: parsed.data, requestId })
    if (!result.ok) {
      return { status: 'error', message: 'Llegaste al máximo de consultorios creados.', name }
    }
    return { status: 'success', path: `/c/${result.clinicId}/inicio` }
  } catch (err) {
    logError('createClinicAction', err, requestId)
    return { status: 'error', message: 'No pudimos crear el consultorio. Probá de nuevo.', name }
  }
}
