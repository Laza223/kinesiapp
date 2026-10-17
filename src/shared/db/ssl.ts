/**
 * TLS contra Postgres decidido en CÓDIGO, no por el `?sslmode=` del DSN.
 *
 * Portado de TurnoGol (`src/shared/db/ssl.ts`, lección de producción del 2026-08-26/27):
 * `postgres` (porsager) copia el `sslmode` tal cual y un valor que no entiende lo hace
 * validar contra el almacén de Node y morir con "self-signed certificate in certificate
 * chain". La salida es no depender del string: localhost va sin TLS y cualquier host remoto
 * valida la cadena contra la raíz pública de Supabase (`./supabase-ca`).
 *
 * A propósito no hay override por variable de entorno: una decisión de TLS editable desde un
 * panel es exactamente lo que este archivo saca de juego. Contra un host remoto que no sea
 * Supabase, falla al conectar — fuerte y a la vista.
 */
import { SUPABASE_ROOT_CA } from './supabase-ca'

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]'])

function isLocalDsn(url: string): boolean {
  try {
    return LOCAL_HOSTS.has(new URL(url).hostname)
  } catch {
    return true
  }
}

type DbSslOptions = { ca: string; rejectUnauthorized: true }

export function dbSslOptions(url: string): DbSslOptions | false {
  return isLocalDsn(url) ? false : { ca: SUPABASE_ROOT_CA, rejectUnauthorized: true }
}
