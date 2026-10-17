import { sql } from 'drizzle-orm'
import { z } from 'zod'
import { withUserContext } from '@/shared/db/client'
import { pgErrorHint } from '@/shared/db/pg-errors'

type CreateClinicResult = { ok: true; clinicId: string } | { ok: false; code: 'CLINIC_LIMIT' }

/** Crea consultorio + membresía de dueño + auditoría en un paso (private.create_clinic). */
export async function createClinic(input: {
  userId: string
  name: string
  requestId: string
}): Promise<CreateClinicResult> {
  try {
    const rows = await withUserContext(input.userId, (tx) =>
      tx.execute(sql`SELECT private.create_clinic(${input.name}, ${input.requestId}) AS id`),
    )
    return { ok: true, clinicId: z.object({ id: z.uuid() }).parse(rows[0]).id }
  } catch (err) {
    if (pgErrorHint(err) === 'clinic_limit') return { ok: false, code: 'CLINIC_LIMIT' }
    throw err
  }
}
