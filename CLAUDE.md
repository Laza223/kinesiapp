# CLAUDE.md

Guía para Claude Code en este repositorio.

# kinesiapp

SaaS para consultorios de kinesiología en Argentina. Monolito Next.js multi-tenant (cada consultorio es un tenant) con aislamiento por RLS. Etapa: **validación**. La base técnica existe; lo clínico se construye recién cuando las entrevistas eligen la cuña ([decisiones](docs/decisions/2026-10-16-arranque.md)).

## Comandos y definición de terminado

Antes de decir "listo", correr esto y **pegar la salida real** (sin salida pegada no hay "listo"):

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm knip   # job "Lint & Types"
pnpm test                    # unitarios
pnpm db:local:up             # Postgres 16 local en :54322 (sin Docker), una vez por sesión
pnpm test:integration        # recrea la base de test y corre integración + aislamiento
pnpm build
```

`pnpm ci:local` corre todo en el orden de CI. Detalle y reglas de tests: skill `protocolo-testing`.

## Stack

- Next.js 16 (App Router, `src/proxy.ts` con runtime Node) + React 19 + TypeScript strict
- Supabase: solo Auth (email + contraseña) con `@supabase/ssr` 0.12.6 fijado exacto. La app NO usa la Data API.
- Postgres vía Drizzle + `postgres` (`prepare: false`). Migraciones SQL a mano en `supabase/migrations/` (única fuente de verdad del schema).
- Zod 4 · Tailwind v4 (tokens provisorios, sin componentes hasta tener DESIGN.md) · Vitest
- Diferido a propósito (motivo en [docs/architecture.md](docs/architecture.md)): Sentry, Playwright, Storybook, pg-boss, MercadoPago, Resend, shadcn.

## Arquitectura del código

- `src/app/*` — rutas y Server Actions (`actions.ts`). Capa fina: guard → servicio del módulo.
- `src/modules/*` — dominio (`auth`, `membership`, `clinics`). La lógica vive acá.
- `src/server/*` — guards y contexto del request (composición de la capa web).
- `src/shared/*` — infraestructura: `db/` (cliente, schema espejo, errores), `env`, `lib`, `observability`. No importa dominio.
- `src/lib/*` — adaptadores de terceros (`supabase/`) y utilidades web (CSP, redirects).
- Capas y prohibiciones las hace cumplir ESLint (`eslint.config.mjs`).

**Núcleo del aislamiento:** `src/shared/db/client.ts`. `withClinicContext({ clinicId, userId }, fn)` abre una transacción y fija `app.current_clinic_id` / `app.current_user_id` con `set_config(…, true)`. Las políticas RLS además verifican la membresía en SQL (`private.has_clinic_role`), así que un contexto falsificado da 0 filas.

**Cadena de un request:** `proxy.ts` (request id, CSP con nonce, refresco de sesión; no autoriza) → página `requireRole(clinicId, roles)` o acción `authorizeAction(clinicId, roles)` → `getAuthUser()` (`getUser`, identidad = `sub`) → membresía leída bajo RLS → servicio. El consultorio activo va en la URL (`/c/[clinicId]/…`) y se re-verifica siempre.

## Invariantes

- Montos: enteros en centavos con moneda explícita. Fechas: `timestamptz` en UTC; presentación es-AR, zona `America/Argentina/Buenos_Aires`. PK: UUID.
- Enums con `canceled` (una L). Nunca `cancelled` (ESLint y el lint de migraciones lo rechazan).
- Documento del paciente flexible (tipo + número, opcional): no excluir extranjeros.
- Toda tabla de un consultorio: `UNIQUE (clinic_id, id)`, FKs compuestas, RLS + FORCE, grants por columna. Checklist: `.claude/rules/tablas-y-rls.md`.

## Datos de salud (reglas duras)

- La historia clínica no se borra ni se pisa: se versiona y se corrige con autor y fecha (Ley 26.529). Custodia ≥10 años.
- Recepción nunca accede a contenido clínico, por RLS (no solo por UI).
- Nada clínico en logs, Sentry, analytics ni en `audit_events.metadata`. Errores de DB: `logError` (Drizzle mete los parámetros en el mensaje).
- La web no tiene credenciales que salteen RLS: ni service-role ni pool BYPASSRLS.
- Datos sintéticos hasta la revisión legal ([preguntas](docs/legal/preguntas-abogado-y-contador.md)).

## No reproponer (decidido)

- Paridad con Pacientia como meta, y REA o cualquier ingeniería inversa sobre productos de terceros ([D1, D5](docs/decisions/2026-10-16-arranque.md)).
- **Regla de evidencia (D7):** ninguna función clínica entra al código sin una entrada FACT o SIGNAL en [`docs/gtm/aprendizajes.md`](docs/gtm/aprendizajes.md). Si un pedido no la tiene, responder "REQUIERE EVIDENCIA" en vez de implementar.
- Fuera de v1 (D12): WhatsApp Business API (sí links `wa.me`), facturación ARCA, IA con datos reales, emitir órdenes o prescripciones, teleconsulta, app nativa, multi-especialidad. Nunca prometer "facturación a obras sociales".

## Documentación

[`PRODUCT.md`](PRODUCT.md) (formato Impeccable) · [`docs/decisions/`](docs/decisions/) · [`docs/backlog.md`](docs/backlog.md) · [`docs/architecture.md`](docs/architecture.md) · [`docs/deploy.md`](docs/deploy.md) · [`docs/gtm/`](docs/gtm/README.md) · [`docs/research/`](docs/research/) · [`docs/legal/`](docs/legal/preguntas-abogado-y-contador.md). Ante contradicción entre docs, señalarla en vez de elegir en silencio.

## Skills del repo

| Situación | Skill |
|---|---|
| Base de datos, migraciones, RLS, Auth, proxy, Server Actions | `convenciones-stack` |
| Correr, arreglar o escribir tests | `protocolo-testing` |

## Guardrails

**SIEMPRE**: TypeScript strict, sin `any` (`unknown` + type guard). Server Actions para mutaciones internas; cada una llama a su guard. Queries solo desde Server Components, Server Actions o servicios.

**PREGUNTAR ANTES**: decisiones de negocio o de producto (reportarlas como pregunta numerada al founder); borrar código o cambiar estructura.

**NUNCA**: commitear o pushear sin pedido · editar una migración ya aplicada (crear una nueva) · aplicar migraciones o tocar entornos remotos (lo hace el founder) · hardcodear credenciales o URLs de producción · inventar tablas, columnas o archivos.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->
