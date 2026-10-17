import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { adminSql, appSql, asApp, closeTestDb, expectPgError } from '../helpers/db'
import { seedClinic, type SeededClinic } from '../helpers/factories'

afterAll(closeTestDb)

/** Tablas con clinic_id. Agregar una tabla nueva sin declararla acá pone el test en rojo. */
const CLINIC_SCOPED = ['audit_events', 'clinic_members', 'clinics', 'patients']

/** Matriz declarada de privilegios del rol de la app: tabla → privilegio → columnas (o '*'). */
const APP_PRIVILEGES: Record<string, Record<string, string[] | '*'>> = {
  audit_events: {
    SELECT: '*',
    INSERT: [
      'action',
      'actor_user_id',
      'clinic_id',
      'entity_id',
      'entity_type',
      'metadata',
      'request_id',
    ],
  },
  clinic_members: { SELECT: '*', UPDATE: ['role', 'status'] },
  clinics: { SELECT: '*', UPDATE: ['name'] },
  patients: {
    SELECT: '*',
    INSERT: ['clinic_id', 'created_by_member_id', 'document_number', 'document_type', 'full_name'],
    UPDATE: ['document_number', 'document_type', 'full_name'],
  },
}

describe('roles de base de datos', () => {
  it('kinesiapp_app no es superusuario, no saltea RLS y no es dueño de tablas', async () => {
    const [role] = await adminSql()`
      SELECT rolsuper, rolbypassrls, rolcanlogin FROM pg_roles WHERE rolname = 'kinesiapp_app'`
    expect(role).toMatchObject({ rolsuper: false, rolbypassrls: false, rolcanlogin: true })
    const owned = await adminSql()`
      SELECT tablename FROM pg_tables WHERE tableowner = 'kinesiapp_app'`
    expect(owned).toHaveLength(0)
  })

  it('los timeouts del rol aplican al conectarse como la app', async () => {
    const [row] = await appSql()`SHOW statement_timeout`
    expect(row!.statement_timeout).toBe('15s')
    const [lock] = await appSql()`SHOW lock_timeout`
    expect(lock!.lock_timeout).toBe('3s')
  })

  it('kinesiapp_worker saltea RLS pero hoy no tiene ningún grant', async () => {
    const [role] =
      await adminSql()`SELECT rolbypassrls FROM pg_roles WHERE rolname = 'kinesiapp_worker'`
    expect(role!.rolbypassrls).toBe(true)
    const grants = await adminSql()`
      SELECT table_name FROM information_schema.role_table_grants WHERE grantee = 'kinesiapp_worker'`
    expect(grants).toHaveLength(0)
  })

  it('toda función SECURITY DEFINER fija search_path y nada de private es ejecutable por PUBLIC', async () => {
    const definers = await adminSql()`
      SELECT p.proname, p.proconfig
      FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname IN ('public', 'private') AND p.prosecdef`
    expect(definers.length).toBeGreaterThan(0)
    for (const fn of definers) {
      expect(fn.proconfig, fn.proname).toContain('search_path=""')
    }
    const exposed = await adminSql()`
      SELECT p.proname
      FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'private'
        AND (has_function_privilege('public', p.oid, 'EXECUTE')
          OR has_function_privilege('anon', p.oid, 'EXECUTE')
          OR has_function_privilege('authenticated', p.oid, 'EXECUTE'))`
    expect(exposed.map((r) => r.proname)).toEqual([])
  })
})

describe('inventario de RLS y privilegios', () => {
  it('las tablas de public son exactamente las declaradas, todas con RLS + FORCE', async () => {
    const rows = await adminSql()`
      SELECT c.relname, c.relrowsecurity, c.relforcerowsecurity
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r' ORDER BY c.relname`
    expect(rows.map((r) => r.relname)).toEqual(CLINIC_SCOPED)
    for (const r of rows) {
      expect(r.relrowsecurity, r.relname).toBe(true)
      expect(r.relforcerowsecurity, r.relname).toBe(true)
    }
  })

  it('toda política apunta solo a kinesiapp_app y ninguna es USING (true)', async () => {
    const policies = await adminSql()`
      SELECT tablename, policyname, roles::text[] AS roles, qual, with_check
      FROM pg_policies WHERE schemaname = 'public'`
    expect(policies.length).toBeGreaterThan(0)
    for (const p of policies) {
      expect(p.roles, p.policyname).toEqual(['kinesiapp_app'])
      expect(p.qual ?? '', p.policyname).not.toBe('true')
      expect(p.with_check ?? '', p.policyname).not.toBe('true')
    }
  })

  it('los privilegios del rol de la app coinciden con la matriz declarada', async () => {
    const tableLevel = await adminSql()`
      SELECT table_name, privilege_type FROM information_schema.role_table_grants
      WHERE grantee = 'kinesiapp_app' AND table_schema = 'public'`
    const columnLevel = await adminSql()`
      SELECT table_name, privilege_type, column_name FROM information_schema.column_privileges
      WHERE grantee = 'kinesiapp_app' AND table_schema = 'public'`
    const actual: Record<string, Record<string, string[] | '*'>> = {}
    for (const r of tableLevel) {
      actual[r.table_name] ??= {}
      actual[r.table_name]![r.privilege_type] = '*'
    }
    for (const r of columnLevel) {
      actual[r.table_name] ??= {}
      const current = actual[r.table_name]![r.privilege_type]
      if (current === '*') continue
      actual[r.table_name]![r.privilege_type] = [...(current ?? []), r.column_name].sort()
    }
    expect(actual).toEqual(APP_PRIVILEGES)
  })

  it('anon, authenticated y service_role no tienen nada en public', async () => {
    const grants = await adminSql()`
      SELECT grantee, table_name FROM information_schema.role_table_grants
      WHERE table_schema = 'public' AND grantee IN ('anon', 'authenticated', 'service_role')`
    expect(grants).toEqual([])
  })
})

describe('permisos por rol dentro del consultorio', () => {
  let A: SeededClinic
  beforeAll(async () => {
    A = await seedClinic('Consultorio Roles')
  })
  const as = (role: 'owner' | 'professional' | 'reception') => ({
    clinicId: A.clinicId,
    userId: A.users[role],
  })

  it.for(['professional', 'reception'] as const)('%s no puede ascenderse a dueño', async (role) => {
    const result = await asApp(
      as(role),
      (tx) => tx`UPDATE clinic_members SET role = 'owner' WHERE id = ${A.members[role]}`,
    )
    expect(result.count).toBe(0)
  })

  it('el dueño puede cambiar el rol de otro miembro', async () => {
    const result = await asApp(
      as('owner'),
      (tx) => tx`UPDATE clinic_members SET role = 'professional' WHERE id = ${A.members.reception}`,
    )
    expect(result.count).toBe(1)
  })

  it('nadie inserta miembros directo: solo por funciones', async () => {
    await expectPgError(
      asApp(
        as('owner'),
        (tx) => tx`
        INSERT INTO clinic_members (clinic_id, user_id, role) VALUES (${A.clinicId}, ${A.users.owner}, 'owner')`,
      ),
      '42501',
    )
  })

  it('el último dueño no puede degradarse', async () => {
    const err = await expectPgError(
      asApp(
        as('owner'),
        (tx) => tx`UPDATE clinic_members SET role = 'professional' WHERE id = ${A.members.owner}`,
      ),
      'P0001',
    )
    expect(err.hint).toBe('last_owner')
  })

  it('solo el dueño lee la auditoría', async () => {
    expect(await asApp(as('owner'), (tx) => tx`SELECT 1 FROM audit_events`)).not.toHaveLength(0)
    expect(await asApp(as('professional'), (tx) => tx`SELECT 1 FROM audit_events`)).toHaveLength(0)
    expect(await asApp(as('reception'), (tx) => tx`SELECT 1 FROM audit_events`)).toHaveLength(0)
  })

  it('no se puede registrar auditoría a nombre de otro usuario', async () => {
    await expectPgError(
      asApp(
        as('reception'),
        (tx) => tx`
        INSERT INTO audit_events (clinic_id, actor_user_id, action, entity_type)
        VALUES (${A.clinicId}, ${A.users.owner}, 'patient.viewed', 'patient')`,
      ),
      '42501',
    )
  })

  it('el estado del consultorio no lo cambia la app (sin grant de columna)', async () => {
    await expectPgError(
      asApp(
        as('owner'),
        (tx) => tx`UPDATE clinics SET status = 'canceled' WHERE id = ${A.clinicId}`,
      ),
      '42501',
    )
  })
})
