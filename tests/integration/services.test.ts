import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createClinic } from '@/modules/clinics/clinics.service'
import { decideClinicAccess } from '@/modules/membership/access'
import { getActiveMembership, listMyMemberships } from '@/modules/membership/membership.service'
import { closeDb, withClinicContext } from '@/shared/db/client'
import { adminSql, closeTestDb, newId } from '../helpers/db'
import { seedClinic, type SeededClinic } from '../helpers/factories'

/** La cadena real de la app (client.ts → servicios) contra Postgres, conectada como kinesiapp_app. */
let A: SeededClinic
let B: SeededClinic
beforeAll(async () => {
  A = await seedClinic('Servicios A')
  B = await seedClinic('Servicios B')
})
afterAll(async () => {
  await closeDb()
  await closeTestDb()
})

describe('getActiveMembership dentro de withClinicContext', () => {
  it.for(['owner', 'professional', 'reception'] as const)(
    '%s ve su membresía y su rol',
    async (role) => {
      const m = await withClinicContext(
        { clinicId: A.clinicId, userId: A.users[role] },
        getActiveMembership,
      )
      expect(m).toMatchObject({
        role,
        clinicName: 'Servicios A',
        clinicStatus: 'active',
        memberId: A.members[role],
      })
    },
  )

  it('un id de consultorio ajeno (URL manipulada) devuelve null', async () => {
    const m = await withClinicContext(
      { clinicId: B.clinicId, userId: A.users.owner },
      getActiveMembership,
    )
    expect(m).toBeNull()
    expect(decideClinicAccess(m, ['owner'])).toEqual({ ok: false, reason: 'NOT_MEMBER' })
  })

  it('un cambio de rol hecho por el dueño se ve en el request siguiente', async () => {
    await adminSql()`UPDATE clinic_members SET role = 'professional' WHERE id = ${A.members.reception}`
    const m = await withClinicContext(
      { clinicId: A.clinicId, userId: A.users.reception },
      getActiveMembership,
    )
    expect(m?.role).toBe('professional')
  })

  it('consultorio suspendido: la membresía se lee pero el acceso se niega', async () => {
    const C = await seedClinic('Servicios C')
    await adminSql()`UPDATE clinics SET status = 'suspended' WHERE id = ${C.clinicId}`
    const m = await withClinicContext(
      { clinicId: C.clinicId, userId: C.users.owner },
      getActiveMembership,
    )
    expect(decideClinicAccess(m, ['owner'])).toEqual({ ok: false, reason: 'CLINIC_INACTIVE' })
  })

  it('ids que no son UUID se rechazan antes de tocar la base', async () => {
    await expect(
      withClinicContext({ clinicId: "x' OR 1=1", userId: A.users.owner }, getActiveMembership),
    ).rejects.toThrow('clinicId inválido')
  })
})

describe('alta y listado', () => {
  it('createClinic + listMyMemberships: el creador queda como dueño de un solo consultorio', async () => {
    const user = newId()
    const result = await createClinic({
      userId: user,
      name: '  Kine Norte  ',
      requestId: 'req-svc',
    })
    expect(result.ok).toBe(true)
    const memberships = await listMyMemberships(user)
    expect(memberships).toHaveLength(1)
    expect(memberships[0]).toMatchObject({
      clinicName: 'Kine Norte',
      role: 'owner',
      clinicStatus: 'active',
    })
  })

  it('el límite de consultorios vuelve como resultado, no como excepción', async () => {
    const user = newId()
    for (let i = 0; i < 5; i++)
      await createClinic({ userId: user, name: `Sede ${i}`, requestId: 'r' })
    expect(await createClinic({ userId: user, name: 'Sede 6', requestId: 'r' })).toEqual({
      ok: false,
      code: 'CLINIC_LIMIT',
    })
  })
})
