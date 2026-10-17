---
name: convenciones-stack
description: Convenciones de kinesiapp para tocar base de datos, migraciones, RLS, Drizzle, Supabase Auth, proxy de Next 16 o Server Actions. Usar antes de escribir código en src/shared/db, supabase/migrations, src/lib/supabase, src/proxy.ts, src/server o cualquier actions.ts.
---

# Convenciones del stack (condensadas de las lecciones de TurnoGol)

## Base de datos
- La web se conecta solo como `kinesiapp_app`. No existe pool BYPASSRLS en la web; si un job lo necesita, va en su propio módulo con `kinesiapp_worker` y su propio DSN.
- Todo acceso: `withClinicContext({ clinicId, userId }, fn)` o `withUserContext(userId, fn)` (`src/shared/db/client.ts`). Fuera de una transacción el contexto se filtraría por el pool.
- Nunca una llamada externa (Supabase Auth, MercadoPago, mail) dentro de `fn`. Primero la base, después la red (o al revés), nunca adentro.
- Sin `try/catch` dentro de `fn` que se trague errores: convierte un rollback en commit.
- `tx.execute(sql\`…\`)` devuelve timestamps como string y claves snake_case: parsear con zod.
- Un `INSERT … RETURNING` también necesita pasar la política de SELECT. Auditoría: insertar sin RETURNING.
- Errores de DB: nunca loguear `err.message` (Drizzle incluye los parámetros = datos de pacientes). Usar `logError` / `pgErrorSummary`.
- Un valor nuevo de enum no se puede usar en la misma transacción que lo crea.
- Montos: enteros en centavos con moneda explícita. Fechas: `timestamptz` en UTC; presentación es-AR, zona `America/Argentina/Buenos_Aires`. Enums con `canceled` (una L).

## Auth y sesión
- `@supabase/ssr` fijado EXACTO (0.12.6). Un caret en 0.x congeló a TurnoGol en 0.3 y causó el bug de sesión del 2026-09-04.
- Solo interfaz `getAll`/`setAll`. El refresco vive en `src/lib/supabase/proxy.ts` (único lugar que puede escribir cookies para la UI); muta el request, borra valores vacíos, reenvía los headers de caché.
- En el servidor: `getUser()` (vía `getAuthUser`), nunca `getSession()` (ESLint lo prohíbe).
- Las acciones de login no redirigen: devuelven la ruta y el cliente hace `window.location.assign` (carrera de cookies en WebKit).
- `signOut({ scope: 'local' })`.

## Next 16
- Leer `node_modules/next/dist/docs/` antes de usar una API nueva: esta versión difiere de lo que uno recuerda.
- `proxy.ts` (no `middleware.ts`), runtime Node. `cookies()`, `headers()` y `params` son async.
- CSP con nonce: todas las páginas son dinámicas (el root layout lee `headers()`); no agregar páginas estáticas que necesiten scripts.
- `'use server'` solo exporta funciones async. Nunca envolver `redirect()` en un try/catch.

## Migraciones
- Un solo árbol: `supabase/migrations/`. Drizzle (`src/shared/db/schema`) es solo el espejo tipado; no se usa drizzle-kit.
- Las migraciones las aplica el founder (`supabase db push`): Claude no corre migraciones contra entornos remotos (denegado en `.claude/settings.json`).
- Checklist de tabla nueva: `.claude/rules/tablas-y-rls.md`.
