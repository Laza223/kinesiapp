# Arquitectura

> Estado al 2026-10-16: base técnica sin funciones clínicas. Este documento registra las decisiones técnicas, qué se portó de TurnoGol y qué no, y qué se difirió y por qué.

## Stack

| Pieza | Elección | Por qué |
|---|---|---|
| Web | Next.js 16.3.8 (App Router) + React 19 + TS strict | Mismo stack que TurnoGol: el founder lo domina y la base está probada en producción |
| Auth | Supabase Auth, email + contraseña, `@supabase/ssr` 0.12.6 **exacto** | Lección del bug de sesión de TurnoGol (2026-09-04): un caret en 0.x congeló la librería en 0.3 |
| Datos | Postgres (Supabase) vía Drizzle + `postgres`, `prepare: false` | Conexión directa con rol propio sujeto a RLS; compatible con el pooler en modo transacción |
| Schema | SQL a mano en `supabase/migrations/` | Una sola fuente de verdad. TurnoGol tenía tres (SQL, espejo de Supabase y Drizzle) y dos tests de drift para mantenerlas alineadas |
| UI | Tailwind v4 con tokens neutros | La identidad visual se define con Impeccable en la semana 3 (DESIGN.md) |
| Tests | Vitest: unit + integración contra Postgres 16 real | La integración corre como el rol de la app, no como superusuario |
| Región (pendiente) | Supabase São Paulo + Vercel `gru1`, o UE | Lo decide el abogado (transferencia internacional, Ley 25.326 art. 12). Ver [D9](decisions/2026-10-16-arranque.md) |

## Modelo de seguridad

1. **Identidad:** solo el `sub` del JWT, validado con `getUser()`. No hay tabla de usuarios propia, no se escribe `app_metadata` y la web no tiene service-role.
2. **Consultorio activo:** en la URL (`/c/[clinicId]/…`). Es una pista: cada request la re-verifica contra la base. Un kinesiólogo que trabaja en dos consultorios puede tener una pestaña de cada uno sin escribir en el equivocado (con una cookie, cambiar de consultorio en una pestaña cambiaba todas).
3. **Rol:** se lee de `clinic_members` en cada request, bajo RLS. Nunca del JWT, de una cookie ni de la URL.
4. **RLS que verifica membresía:** las políticas no se conforman con `clinic_id = GUC`; llaman a `private.has_clinic_role(roles)` (SECURITY DEFINER, envuelta en `(SELECT …)` para evaluarse una vez por sentencia). Un GUC o una URL falsificados dan 0 filas.
5. **Asociaciones imposibles entre consultorios:** `UNIQUE (clinic_id, id)` en cada tabla y FKs compuestas `(clinic_id, x_id)`. Rige también para caminos que salteen RLS.
6. **Grants por columna:** la app no puede cambiar `clinic_id`, `status` del consultorio, `occurred_at` de la auditoría ni insertar membresías (solo por `private.create_clinic`). Nadie tiene `DELETE`.
7. **Auditoría append-only:** `audit_events` sin UPDATE, DELETE ni TRUNCATE, ni siquiera para el dueño de la tabla (triggers). Guarda quién, qué, sobre qué y cuándo; nunca contenido clínico (`metadata` ≤2 KB).
8. **Funciones privilegiadas:** solo en el schema `private`, con `search_path = ''` y `EXECUTE` explícito al rol de la app. El EXECUTE por defecto a PUBLIC se revoca a nivel global en la migración 0001: la versión por schema no funciona en Postgres (lo detectó `roles-and-privileges.test.ts`).
9. **Web:** CSP con nonce y `'strict-dynamic'` (sin `'unsafe-inline'` en scripts), HSTS, `X-Frame-Options: DENY`, `noindex`. Cookies de sesión `httpOnly` con vida de 12 h (PCs de recepción compartidas; se revisa con los pilotos).
10. **Logs:** `logError` registra código, constraint, tabla y request id, nunca `err.message` (Drizzle incluye ahí los parámetros de la query).

## Qué se portó de TurnoGol

Fuente: `Laza223/turno-gol-repo` @ `4afc709`.

| kinesiapp | Origen en TurnoGol | Cambios |
|---|---|---|
| `src/shared/db/client.ts` | `src/shared/db/client.ts` | Recortado a ~120 líneas: pool, `withClinicContext` / `withUserContext` y validación de UUID. Sin pool BYPASSRLS, sin contextos de jugador o admin y sin `SET LOCAL ROLE` |
| `src/shared/db/ssl.ts`, `supabase-ca.ts` | ídem | TLS decidido en código; solo la rama de `postgres` |
| `src/shared/db/pg-errors.ts` | ídem | Más `pgErrorSummary` para loguear sin datos |
| `src/lib/supabase/server.ts`, `proxy.ts` | `src/lib/supabase/server.ts`, `middleware.ts` | Publishable key, `getClaims()`, cookies `httpOnly` de 12 h y reenvío de los headers de caché de `setAll` (TurnoGol los ignoraba) |
| `src/proxy.ts` | `middleware.ts` | Next 16 (`proxy`, runtime Node), con nonce para la CSP. Sin rate limit ni Fetch-Metadata (diferidos) |
| `src/server/guards.ts` | `src/modules/staff/guards.ts` + `src/server/middleware/with-tenant.ts` | Rol leído bajo RLS en la transacción del consultorio, no con el pool que saltea RLS |
| `src/lib/safe-redirect.ts`, `src/shared/lib/request-id.ts` | ídem | Sin cambios de fondo |
| Tests de aislamiento | `tests/integration/isolation-app-role.test.ts` | Ahora es el patrón por defecto de toda la suite |
| ESLint, knip, Prettier, CI, gitleaks, `.claude/` | ídem | Condensados; las prohibiciones de seguridad pasaron a reglas de ESLint |

## Riesgos de TurnoGol que acá no existen

| Riesgo en TurnoGol | En kinesiapp |
|---|---|
| Pool que saltea RLS usado en 21 archivos de la web (login, resolución de rol) | No hay pool BYPASSRLS en la web; el rol se lee bajo RLS |
| Impersonación del super-admin que escribe como el primer admin del complejo | No hay impersonación. El acceso de soporte, si hace falta, será excepcional, acotado y auditado |
| `audit_logs` con copias completas antes/después | `audit_events` sin contenido; `metadata` acotada |
| Archivos con URL pública permanente (R2) y CSP con `unsafe-inline` | Todavía no hay adjuntos (irán privados con URL firmada de vida corta). La CSP usa nonce |
| Borrado total del tenant 90 días después del churn | Sin DELETE en ninguna tabla. La custodia de la historia clínica es ≥10 años, y la baja se convierte en un plan "archivo" |

## Verificación

- `tests/integration/isolation.test.ts` (bloqueante), en dos consultorios con dueño, profesional, recepción, paciente y auditoría:
  - lectura, escritura, actualización y borrado cruzados;
  - contexto falsificado o ausente;
  - miembro desactivado;
  - filtración del contexto entre transacciones;
  - FKs compuestas;
  - autoría falsificada.
- `tests/integration/roles-and-privileges.test.ts` compara contra el catálogo real:
  - atributos de los roles;
  - inventario de tablas con RLS + FORCE;
  - políticas solo para `kinesiapp_app`;
  - la matriz exacta de privilegios por columna;
  - permisos por rol dentro del consultorio.
- **Prueba de mutación (2026-10-16):** con `ALTER POLICY patients_select ON patients USING (true)`, el test de aislamiento falló en 7 casos; restaurada la política, volvió a verde (37/37). Repetirla al tocar una política.
- Navegador headless sobre el build de producción:
  - el formulario de ingreso hidrata con los scripts con nonce;
  - la Server Action responde;
  - no hay violaciones de CSP.

**Límite conocido:** el login contra GoTrue real no se probó de punta a punta (no había proyecto de Supabase ni Docker). Se prueba en staging.

## Diferido, con motivo

| Herramienta | Cuándo | Motivo |
|---|---|---|
| Sentry | Antes del primer piloto con datos | Necesita cuenta. Requisitos: lista blanca de campos (no lista negra como TurnoGol), `sendDefaultPii: false`, sin Session Replay, `user = { id }` |
| Rate limiting (Upstash) | Antes de abrir el registro al público | Necesita cuenta. Hoy frenan Supabase Auth y el tope de 5 consultorios por usuario |
| Fetch-Metadata anti-CSRF | Con el primer route handler que mute | Las Server Actions ya verifican el Origin |
| Playwright e2e | Con staging | Un e2e útil necesita GoTrue |
| Storybook, shadcn | Con DESIGN.md (semana 3) | No hay sistema de diseño todavía |
| pg-boss + worker | Con el primer job (recordatorios, cobro del SaaS) | Railway no tiene región en Sudamérica: evaluar alternativas cerca de la base |
| MercadoPago | Con el primer cobro | Portar de TurnoGol la máquina de estados de suscripción, la firma de webhooks y la idempotencia; precio por profesional |
| dependency-cruiser, semgrep | Con más módulos | ESLint ya cubre capas y prohibiciones |
