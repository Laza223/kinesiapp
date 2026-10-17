import postgres, { type Sql } from 'postgres'
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { sql } from 'drizzle-orm'
import { readServerEnv } from '@/shared/env'
import { dbSslOptions } from './ssl'
import * as schema from './schema'

/**
 * Único punto de acceso a Postgres de la web. Portado (recortado) de TurnoGol
 * `src/shared/db/client.ts`.
 *
 * Reglas que este archivo hace cumplir:
 *   - La web se conecta SOLO como `kinesiapp_app` (sujeto a RLS). No existe acá un pool que
 *     saltee RLS: el que lo necesite (jobs) tendrá su propio módulo y su propio rol.
 *   - Todo acceso a datos pasa por `withClinicContext` / `withUserContext`: abren una
 *     transacción y fijan el contexto con `set_config(..., true)` (equivale a SET LOCAL).
 *     Fuera de una transacción, un SET se filtraría a la próxima request que tome la
 *     conexión del pool (y con el pooler de Supabase en modo transacción, a otro cliente).
 *   - Nunca una llamada externa (Supabase Auth, MercadoPago, mail) dentro de `fn`: retiene la
 *     conexión y los locks mientras espera la red.
 *   - `tx.execute(sql`...`)` devuelve timestamps como string y claves snake_case: parsear
 *     las filas crudas con zod en vez de castearlas.
 */

type Db = PostgresJsDatabase<typeof schema>
export type DbTx = Parameters<Parameters<Db['transaction']>[0]>[0]

// Serverless: cada instancia abre su propio pool. 3 conexiones × N instancias ya alcanza para
// agotar el pool_size del pooler; los tests de integración lo suben con DATABASE_POOL_MAX.
const DEFAULT_POOL_MAX = 3
const IDLE_TIMEOUT_SECONDS = 20
const MAX_LIFETIME_SECONDS = 30 * 60

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const globalForDb = globalThis as unknown as { __kinesiappSql?: Sql; __kinesiappDb?: Db }

function poolMax(): number {
  const n = Number(process.env.DATABASE_POOL_MAX)
  return Number.isInteger(n) && n > 0 ? n : DEFAULT_POOL_MAX
}

function getDb(): Db {
  if (globalForDb.__kinesiappDb) return globalForDb.__kinesiappDb
  const { DATABASE_URL } = readServerEnv({
    ...process.env,
    // Los tests de DB no necesitan Supabase: solo se exige lo que este módulo usa.
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://unused.invalid',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'unused-unused-unused-unused',
  })
  const client = postgres(DATABASE_URL, {
    ssl: dbSslOptions(DATABASE_URL),
    max: poolMax(),
    idle_timeout: IDLE_TIMEOUT_SECONDS,
    max_lifetime: MAX_LIFETIME_SECONDS,
    // Obligatorio detrás del pooler de Supabase en modo transacción.
    prepare: false,
    onnotice: () => {},
  })
  const db = drizzle(client, { schema })
  // Persistir entre recargas de módulos en dev (HMR); en producción el módulo se evalúa una vez.
  globalForDb.__kinesiappSql = client
  globalForDb.__kinesiappDb = db
  return db
}

function assertUuid(value: string, name: string): void {
  if (!UUID_RE.test(value)) throw new Error(`${name} inválido`)
}

/** Transacción con usuario y consultorio en contexto: el camino normal de toda la app. */
export async function withClinicContext<T>(
  ctx: { clinicId: string; userId: string },
  fn: (tx: DbTx) => Promise<T>,
): Promise<T> {
  assertUuid(ctx.clinicId, 'clinicId')
  assertUuid(ctx.userId, 'userId')
  return getDb().transaction(async (tx) => {
    await tx.execute(
      sql`SELECT set_config('app.current_clinic_id', ${ctx.clinicId}, true),
                 set_config('app.current_user_id', ${ctx.userId}, true)`,
    )
    return fn(tx)
  })
}

/**
 * Transacción con SOLO el usuario en contexto. Únicamente para lo que todavía no tiene
 * consultorio: listar mis membresías y crear un consultorio (funciones de `private`).
 */
export async function withUserContext<T>(userId: string, fn: (tx: DbTx) => Promise<T>): Promise<T> {
  assertUuid(userId, 'userId')
  return getDb().transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.current_user_id', ${userId}, true)`)
    return fn(tx)
  })
}

/** Cierra el pool (tests y scripts). */
export async function closeDb(): Promise<void> {
  const client = globalForDb.__kinesiappSql
  globalForDb.__kinesiappSql = undefined
  globalForDb.__kinesiappDb = undefined
  if (client) await client.end({ timeout: 5 })
}
