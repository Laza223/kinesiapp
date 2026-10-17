import { sql } from 'drizzle-orm'
import { z } from 'zod'
import { withUserContext, type DbTx } from '@/shared/db/client'
import { CLINIC_ROLES } from './roles'

const membershipRow = z.object({
  clinic_id: z.uuid(),
  clinic_name: z.string(),
  clinic_status: z.enum(['active', 'suspended', 'canceled']),
  role: z.enum(CLINIC_ROLES),
})
export type MyMembership = {
  clinicId: string
  clinicName: string
  clinicStatus: z.infer<typeof membershipRow>['clinic_status']
  role: z.infer<typeof membershipRow>['role']
}

/** Consultorios donde el usuario es miembro activo (función SECURITY DEFINER acotada a él). */
export async function listMyMemberships(userId: string): Promise<MyMembership[]> {
  const rows = await withUserContext(userId, (tx) =>
    tx.execute(
      sql`SELECT clinic_id, clinic_name, clinic_status, role FROM private.my_memberships()`,
    ),
  )
  return rows.map((raw) => {
    const r = membershipRow.parse(raw)
    return {
      clinicId: r.clinic_id,
      clinicName: r.clinic_name,
      clinicStatus: r.clinic_status,
      role: r.role,
    }
  })
}

const activeRow = z.object({
  member_id: z.uuid(),
  role: z.enum(CLINIC_ROLES),
  clinic_name: z.string(),
  clinic_status: z.enum(['active', 'suspended', 'canceled']),
})
export type ActiveMembership = {
  memberId: string
  role: z.infer<typeof activeRow>['role']
  clinicName: string
  clinicStatus: z.infer<typeof activeRow>['clinic_status']
}

/**
 * Membresía del usuario del contexto en el consultorio del contexto, leída BAJO RLS dentro de
 * la transacción de `withClinicContext`. 0 filas = no es miembro activo (o el contexto es
 * falso). El rol nunca sale del JWT ni de la URL.
 */
export async function getActiveMembership(tx: DbTx): Promise<ActiveMembership | null> {
  const rows = await tx.execute(sql`
    SELECT m.id AS member_id, m.role, c.name AS clinic_name, c.status AS clinic_status
    FROM clinic_members m JOIN clinics c ON c.id = m.clinic_id
    WHERE m.clinic_id = private.current_clinic_id()
      AND m.user_id = private.current_user_id()
      AND m.status = 'active'`)
  const raw = rows[0]
  if (!raw) return null
  const r = activeRow.parse(raw)
  return {
    memberId: r.member_id,
    role: r.role,
    clinicName: r.clinic_name,
    clinicStatus: r.clinic_status,
  }
}
