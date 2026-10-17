import postgres, { type Sql } from 'postgres'
import { randomUUID } from 'node:crypto'

/**
 * Dos conexiones con roles distintos, a propósito:
 *   - adminSql(): superusuario. SOLO para sembrar y para inspeccionar el catálogo.
 *   - appSql():   el rol real de la app (kinesiapp_app). Toda aserción de aislamiento va acá.
 * TurnoGol corría la mayoría de sus tests como superusuario y eso le dio verdes falsos.
 */
let admin: Sql | null = null
let app: Sql | null = null

export function adminSql(): Sql {
  admin ??= postgres(process.env.TEST_ADMIN_DATABASE_URL!, { max: 1, onnotice: () => {} })
  return admin
}

export function appSql(): Sql {
  app ??= postgres(process.env.DATABASE_URL!, { max: 1, onnotice: () => {} })
  return app
}

export async function closeTestDb(): Promise<void> {
  await Promise.all([admin?.end({ timeout: 5 }), app?.end({ timeout: 5 })])
  admin = null
  app = null
}

export type Ctx = { clinicId?: string | null; userId?: string | null }

/**
 * Corre `fn` como kinesiapp_app con el contexto dado, dentro de una transacción que SIEMPRE
 * se revierte (los tests no ensucian la base entre sí).
 */
export async function asApp<T>(
  ctx: Ctx,
  fn: (tx: postgres.TransactionSql) => Promise<T>,
): Promise<T> {
  const sql = appSql()
  let result: T | undefined
  let failure: unknown = null
  await sql
    .begin(async (tx) => {
      if (ctx.clinicId) await tx`SELECT set_config('app.current_clinic_id', ${ctx.clinicId}, true)`
      if (ctx.userId) await tx`SELECT set_config('app.current_user_id', ${ctx.userId}, true)`
      try {
        result = await fn(tx)
      } catch (err) {
        failure = err
      }
      throw new Rollback()
    })
    .catch((err) => {
      if (!(err instanceof Rollback)) throw err
    })
  if (failure) throw failure
  return result as T
}

class Rollback extends Error {}

/** Espera que la promesa falle con ese SQLSTATE y devuelve el error. */
export async function expectPgError(
  promise: Promise<unknown>,
  code: string,
): Promise<postgres.PostgresError> {
  try {
    await promise
  } catch (err) {
    const pg = err as postgres.PostgresError
    if (pg.code !== code) {
      throw new Error(
        `Se esperaba SQLSTATE ${code} y llegó ${pg.code ?? 'sin código'}: ${pg.message}`,
      )
    }
    return pg
  }
  throw new Error(`Se esperaba SQLSTATE ${code} y la operación no falló`)
}

export const newId = (): string => randomUUID()
