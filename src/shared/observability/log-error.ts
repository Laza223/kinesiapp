import { pgErrorSummary } from '@/shared/db/pg-errors'

/**
 * Log de errores del servidor SIN datos de pacientes. Nunca se loguea `err.message` de un
 * error de base: Drizzle mete los parámetros de la query en el mensaje. Solo viaja el código,
 * el constraint, la tabla, el nombre del error y el request id.
 */
export function logError(where: string, err: unknown, requestId?: string): void {
  const pg = pgErrorSummary(err)
  console.error(
    JSON.stringify({
      level: 'error',
      where,
      requestId: requestId ?? null,
      error: err instanceof Error ? err.name : typeof err,
      pgCode: pg.code,
      constraint: pg.constraint,
      table: pg.table,
    }),
  )
}
