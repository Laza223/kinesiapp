import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { adminSql, asApp, closeTestDb, expectPgError, newId } from '../helpers/db'
import { seedClinic, type SeededClinic } from '../helpers/factories'

let A: SeededClinic
beforeAll(async () => {
  A = await seedClinic('Consultorio Auditoría')
})
afterAll(closeTestDb)

describe('audit_events es append-only', () => {
  const owner = () => ({ clinicId: A.clinicId, userId: A.users.owner })

  it('la app no puede actualizar ni borrar ni truncar', async () => {
    await expectPgError(
      asApp(owner(), (tx) => tx`UPDATE audit_events SET action = 'x.y'`),
      '42501',
    )
    await expectPgError(
      asApp(owner(), (tx) => tx`DELETE FROM audit_events`),
      '42501',
    )
    await expectPgError(
      asApp(owner(), (tx) => tx`TRUNCATE audit_events`),
      '42501',
    )
  })

  it('ni el superusuario puede modificar una fila (trigger)', async () => {
    await expectPgError(
      adminSql()`UPDATE audit_events SET action = 'x.y' WHERE clinic_id = ${A.clinicId}`,
      '42501',
    )
    await expectPgError(
      adminSql()`DELETE FROM audit_events WHERE clinic_id = ${A.clinicId}`,
      '42501',
    )
  })

  it('la app no puede fechar hacia atrás (sin grant sobre occurred_at)', async () => {
    await expectPgError(
      asApp(
        owner(),
        (tx) => tx`
        INSERT INTO audit_events (clinic_id, actor_user_id, action, entity_type, occurred_at)
        VALUES (${A.clinicId}, ${A.users.owner}, 'patient.viewed', 'patient', '2020-01-01')`,
      ),
      '42501',
    )
  })

  it('recepción inserta sin RETURNING; con RETURNING falla (no puede leer auditoría)', async () => {
    const reception = { clinicId: A.clinicId, userId: A.users.reception }
    const ok = await asApp(
      reception,
      (tx) => tx`
      INSERT INTO audit_events (clinic_id, actor_user_id, action, entity_type)
      VALUES (${A.clinicId}, ${A.users.reception}, 'patient.viewed', 'patient')`,
    )
    expect(ok.count).toBe(1)
    await expectPgError(
      asApp(
        reception,
        (tx) => tx`
        INSERT INTO audit_events (clinic_id, actor_user_id, action, entity_type)
        VALUES (${A.clinicId}, ${A.users.reception}, 'patient.viewed', 'patient') RETURNING id`,
      ),
      '42501',
    )
  })

  it('metadata de más de 2 KB se rechaza', async () => {
    const big = JSON.stringify({ blob: 'x'.repeat(4000) })
    await expectPgError(
      asApp(
        owner(),
        (tx) => tx`
        INSERT INTO audit_events (clinic_id, actor_user_id, action, entity_type, metadata)
        VALUES (${A.clinicId}, ${A.users.owner}, 'patient.viewed', 'patient', ${big}::jsonb)`,
      ),
      '23514',
    )
  })
})

describe('alta de consultorio', () => {
  it('create_clinic deja al creador como dueño y registra la auditoría', async () => {
    const user = newId()
    const clinicId = await asApp({ userId: user }, async (tx) => {
      const [row] = await tx`SELECT private.create_clinic('Kine Centro', 'req-1') AS id`
      const id = row!.id as string
      await tx`SELECT set_config('app.current_clinic_id', ${id}, true)`
      const [member] = await tx`SELECT role FROM clinic_members WHERE user_id = ${user}`
      expect(member!.role).toBe('owner')
      const audit = await tx`SELECT action, request_id FROM audit_events WHERE clinic_id = ${id}`
      expect(audit).toEqual([{ action: 'clinic.created', request_id: 'req-1' }])
      return id
    })
    expect(clinicId).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('sin usuario en el contexto, falla', async () => {
    await expectPgError(
      asApp({}, (tx) => tx`SELECT private.create_clinic('Sin usuario')`),
      '42501',
    )
  })

  it('el sexto consultorio del mismo usuario se rechaza', async () => {
    const user = newId()
    const err = await expectPgError(
      asApp({ userId: user }, async (tx) => {
        for (let i = 0; i < 6; i++) await tx`SELECT private.create_clinic(${'Sede ' + i})`
      }),
      'P0001',
    )
    expect(err.hint).toBe('clinic_limit')
  })

  it('un nombre inválido se rechaza', async () => {
    await expectPgError(
      asApp({ userId: newId() }, (tx) => tx`SELECT private.create_clinic(' ')`),
      '23514',
    )
  })

  it('my_memberships devuelve solo los consultorios del usuario del contexto', async () => {
    const rows = await asApp(
      { userId: A.users.professional },
      (tx) => tx`SELECT clinic_id, role FROM private.my_memberships()`,
    )
    expect(rows).toEqual([{ clinic_id: A.clinicId, role: 'professional' }])
    const none = await asApp(
      { userId: newId() },
      (tx) => tx`SELECT 1 FROM private.my_memberships()`,
    )
    expect(none).toHaveLength(0)
  })
})
