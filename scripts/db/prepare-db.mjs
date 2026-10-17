// Recrea la base de test/dev desde cero y aplica supabase/migrations/*.sql en orden.
// Es el MISMO script para local y CI (TurnoGol tenía tres copias que divergieron).
//
//   TEST_ADMIN_DATABASE_URL  superusuario (siembra y DDL)   default: postgres@127.0.0.1:54322/kinesiapp_test
//   DATABASE_URL             rol de la app (kinesiapp_app)   default: kinesiapp_app@127.0.0.1:54322/kinesiapp_test
//
// Pasos: (1) se niega a tocar algo que no sea local y *_test/*_dev; (2) crea los roles que
// Supabase trae de fábrica (anon, authenticated, service_role); (3) DROP + CREATE de la base;
// (4) reproduce los grants por defecto de Supabase en `public`, para que la migración que los
// revoca se ejercite de verdad; (5) aplica las migraciones, una transacción por archivo;
// (6) habilita LOGIN de los roles de la app con la contraseña del DSN.
import postgres from 'postgres'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const ADMIN_URL =
  process.env.TEST_ADMIN_DATABASE_URL ??
  'postgres://postgres:postgres@127.0.0.1:54322/kinesiapp_test'
const APP_URL =
  process.env.DATABASE_URL ?? 'postgres://kinesiapp_app:local_app_pw@127.0.0.1:54322/kinesiapp_test'
const WORKER_URL =
  process.env.WORKER_DATABASE_URL ??
  'postgres://kinesiapp_worker:local_worker_pw@127.0.0.1:54322/kinesiapp_test'
const MIGRATIONS_DIR = 'supabase/migrations'
const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost', '::1', '[::1]'])

function assertSafeTarget(urlString) {
  const url = new URL(urlString)
  const dbName = url.pathname.slice(1)
  if (!LOCAL_HOSTS.has(url.hostname)) {
    throw new Error(`prepare-db solo corre contra Postgres local; host recibido: ${url.hostname}`)
  }
  if (!/_(test|dev)$/.test(dbName)) {
    throw new Error(`prepare-db solo recrea bases *_test o *_dev; recibido: ${dbName}`)
  }
  return dbName
}

function quoteLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`
}

async function main() {
  const dbName = assertSafeTarget(ADMIN_URL)
  const maintenanceUrl = new URL(ADMIN_URL)
  maintenanceUrl.pathname = '/postgres'

  const maintenance = postgres(maintenanceUrl.toString(), { max: 1, onnotice: () => {} })
  await maintenance.unsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon NOLOGIN; END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN CREATE ROLE service_role NOLOGIN; END IF;
    END $$;
  `)
  await maintenance.unsafe(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`)
  await maintenance.unsafe(`CREATE DATABASE "${dbName}"`)
  await maintenance.unsafe(`ALTER DATABASE "${dbName}" SET timezone TO 'UTC'`)
  await maintenance.end()

  const admin = postgres(ADMIN_URL, { max: 1, onnotice: () => {} })
  await admin.unsafe(`
    GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;
  `)

  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort()
  for (const file of files) {
    const text = await readFile(join(MIGRATIONS_DIR, file), 'utf8')
    await admin.begin((tx) => tx.unsafe(text))
  }

  for (const [role, dsn] of [
    ['kinesiapp_app', APP_URL],
    ['kinesiapp_worker', WORKER_URL],
  ]) {
    const password = decodeURIComponent(new URL(dsn).password)
    if (!password) throw new Error(`Falta la contraseña de ${role} en su DSN`)
    await admin.unsafe(`ALTER ROLE ${role} LOGIN PASSWORD ${quoteLiteral(password)}`)
  }
  await admin.end()
  console.log(`prepare-db: ${dbName} recreada con ${files.length} migraciones`)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
