import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { adminSql, appSql, asApp, closeTestDb, expectPgError, newId } from '../helpers/db'
import { seedClinic, type SeededClinic } from '../helpers/factories'

/**
 * Aislamiento entre consultorios, medido como el rol REAL de la app (kinesiapp_app).
 * Es el test bloqueante del repo: si una política se afloja, esto tiene que ponerse rojo.
 * Control de que efectivamente detecta regresiones: docs/architecture.md (prueba de mutación).
 */

const TABLES = ['clinics', 'clinic_members', 'patients', 'audit_events'] as const
let A: SeededClinic
let B: SeededClinic

beforeAll(async () => {
  A = await seedClinic('Consultorio A')
  B = await seedClinic('Consultorio B')
})
afterAll(closeTestDb)

const ownerA = () => ({ clinicId: A.clinicId, userId: A.users.owner })

function idColumn(table: (typeof TABLES)[number]): string {
  return table === 'clinics' ? 'id' : 'clinic_id'
}

describe('controles', () => {
  it('0.1 el dueño de A ve su paciente (control negativo)', async () => {
    const rows = await asApp(
      ownerA(),
      (tx) => tx`SELECT id FROM patients WHERE id = ${A.patientId}`,
    )
    expect(rows).toHaveLength(1)
  })

  it('0.2 el superusuario ve el paciente de B (la fila existe)', async () => {
    const rows = await adminSql()`SELECT id FROM patients WHERE id = ${B.patientId}`
    expect(rows).toHaveLength(1)
  })

  it('0.3 la conexión de la app es kinesiapp_app', async () => {
    const [row] = await appSql()`SELECT current_user AS u`
    expect(row!.u).toBe('kinesiapp_app')
  })
})

describe('A no alcanza datos de B', () => {
  it.for(TABLES)('1 %s: seleccionar filas de B por id desde A devuelve 0', async (table) => {
    const rows = await asApp(ownerA(), (tx) =>
      tx.unsafe(`SELECT 1 FROM ${table} WHERE ${idColumn(table)} = $1`, [B.clinicId]),
    )
    expect(rows).toHaveLength(0)
  })

  it('2 insertar un paciente con clinic_id de B falla con 42501', async () => {
    const err = await expectPgError(
      asApp(
        ownerA(),
        (tx) => tx`
        INSERT INTO patients (clinic_id, full_name, created_by_member_id)
        VALUES (${B.clinicId}, 'Intruso', ${B.members.owner})`,
      ),
      '42501',
    )
    expect(err.message).toContain('patients')
  })

  it('2b insertar auditoría en B desde A falla con 42501', async () => {
    await expectPgError(
      asApp(
        ownerA(),
        (tx) => tx`
        INSERT INTO audit_events (clinic_id, actor_user_id, action, entity_type)
        VALUES (${B.clinicId}, ${A.users.owner}, 'patient.viewed', 'patient')`,
      ),
      '42501',
    )
  })

  it('3 actualizar filas de B afecta 0 filas', async () => {
    const result = await asApp(
      ownerA(),
      (tx) => tx`UPDATE patients SET full_name = 'pisado' WHERE id = ${B.patientId}`,
    )
    expect(result.count).toBe(0)
    const [row] = await adminSql()`SELECT full_name FROM patients WHERE id = ${B.patientId}`
    expect(row!.full_name).not.toBe('pisado')
  })

  it('3b mover un paciente propio a B (UPDATE de clinic_id) falla con 42501', async () => {
    await expectPgError(
      asApp(
        ownerA(),
        (tx) => tx`UPDATE patients SET clinic_id = ${B.clinicId} WHERE id = ${A.patientId}`,
      ),
      '42501',
    )
  })

  it.for(TABLES)('4 %s: DELETE falla con 42501 (nadie borra)', async (table) => {
    await expectPgError(
      asApp(ownerA(), (tx) =>
        tx.unsafe(`DELETE FROM ${table} WHERE ${idColumn(table)} = $1`, [A.clinicId]),
      ),
      '42501',
    )
  })
})

describe('contexto falsificado o ausente', () => {
  it.for(TABLES)('5 %s: contexto de B con el usuario de A ve 0 filas', async (table) => {
    const rows = await asApp({ clinicId: B.clinicId, userId: A.users.owner }, (tx) =>
      tx.unsafe(`SELECT 1 FROM ${table}`),
    )
    expect(rows).toHaveLength(0)
  })

  it('5b contexto de B con el usuario de A no puede insertar', async () => {
    await expectPgError(
      asApp(
        { clinicId: B.clinicId, userId: A.users.owner },
        (tx) => tx`
        INSERT INTO patients (clinic_id, full_name, created_by_member_id)
        VALUES (${B.clinicId}, 'Intruso', ${B.members.owner})`,
      ),
      '42501',
    )
  })

  it.for(TABLES)('6 %s: usuario inventado en el contexto de A ve 0 filas', async (table) => {
    const rows = await asApp({ clinicId: A.clinicId, userId: newId() }, (tx) =>
      tx.unsafe(`SELECT 1 FROM ${table}`),
    )
    expect(rows).toHaveLength(0)
  })

  it.for(TABLES)('6b %s: dueño de B con el consultorio de A ve 0 filas', async (table) => {
    const rows = await asApp({ clinicId: A.clinicId, userId: B.users.owner }, (tx) =>
      tx.unsafe(`SELECT 1 FROM ${table}`),
    )
    expect(rows).toHaveLength(0)
  })

  it.for(TABLES)('7 %s: sin contexto, 0 filas (falla cerrado)', async (table) => {
    const rows = await asApp({}, (tx) => tx.unsafe(`SELECT 1 FROM ${table}`))
    expect(rows).toHaveLength(0)
  })

  it('8 un miembro desactivado ve 0 filas', async () => {
    const extra = await seedClinic('Consultorio C')
    await adminSql()`UPDATE clinic_members SET status = 'inactive' WHERE id = ${extra.members.professional}`
    const rows = await asApp(
      { clinicId: extra.clinicId, userId: extra.users.professional },
      (tx) => tx`SELECT 1 FROM patients`,
    )
    expect(rows).toHaveLength(0)
  })

  it('9 el contexto no se filtra a la siguiente transacción de la misma conexión', async () => {
    await asApp(ownerA(), async (tx) => tx`SELECT 1`)
    const [row] = await appSql()`
      SELECT current_setting('app.current_clinic_id', true) AS clinic,
             current_setting('app.current_user_id', true) AS usr`
    expect(row!.clinic ?? '').toBe('')
    expect(row!.usr ?? '').toBe('')
    const rows = await appSql()`SELECT 1 FROM patients`
    expect(rows).toHaveLength(0)
  })
})

describe('FK compuestas: asociar registros de dos consultorios es imposible', () => {
  it('10 paciente de A con autor de B falla (23503) también como superusuario', async () => {
    await expectPgError(
      adminSql()`
        INSERT INTO patients (clinic_id, full_name, created_by_member_id)
        VALUES (${A.clinicId}, 'Cruzado', ${B.members.owner})`,
      '23503',
    )
  })

  it('10b la autoría no se puede falsificar dentro del mismo consultorio', async () => {
    await expectPgError(
      asApp(
        { clinicId: A.clinicId, userId: A.users.reception },
        (tx) => tx`
        INSERT INTO patients (clinic_id, full_name, created_by_member_id)
        VALUES (${A.clinicId}, 'Firmado por otro', ${A.members.professional})`,
      ),
      '42501',
    )
  })

  it('10c recepción carga un paciente firmado por sí misma', async () => {
    const result = await asApp(
      { clinicId: A.clinicId, userId: A.users.reception },
      (tx) => tx`
      INSERT INTO patients (clinic_id, full_name, document_type, document_number, created_by_member_id)
      VALUES (${A.clinicId}, 'María Pasaporte', 'pasaporte', 'AB123456', ${A.members.reception})`,
    )
    expect(result.count).toBe(1)
  })
})
