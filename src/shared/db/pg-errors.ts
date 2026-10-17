/**
 * Lectura de errores de Postgres a través de los envoltorios de Drizzle.
 *
 * Drizzle 0.45 envuelve lo que tira postgres-js en un `DrizzleQueryError`: el `code` viaja en
 * `cause`, no en el error de arriba. Mirar solo el nivel superior deja escapar un 23505 crudo.
 * OJO: el `message` de `DrizzleQueryError` incluye los PARÁMETROS de la query (o sea, datos
 * de pacientes). Nunca loguear `err.message` de un error de DB: usar `pgErrorSummary`.
 */

type PgErrorLike = {
  code?: string
  constraint_name?: string
  constraint?: string
  table_name?: string
  hint?: string
}

function asPgError(err: unknown): PgErrorLike | null {
  let current: unknown = err
  for (let depth = 0; depth < 5 && current != null; depth++) {
    if (typeof current === 'object' && 'code' in current) {
      const code = (current as { code?: unknown }).code
      if (typeof code === 'string') return current as PgErrorLike
    }
    current = (current as { cause?: unknown }).cause
  }
  return null
}

/** HINT de un RAISE de nuestras funciones (p. ej. 'clinic_limit', 'last_owner'). */
export function pgErrorHint(err: unknown): string | null {
  return asPgError(err)?.hint ?? null
}

/** Lo único de un error de DB que se puede loguear: código, constraint y tabla. Nunca valores. */
export function pgErrorSummary(err: unknown): {
  code: string | null
  constraint: string | null
  table: string | null
} {
  const pg = asPgError(err)
  return {
    code: pg?.code ?? null,
    constraint: pg?.constraint_name ?? pg?.constraint ?? null,
    table: pg?.table_name ?? null,
  }
}
