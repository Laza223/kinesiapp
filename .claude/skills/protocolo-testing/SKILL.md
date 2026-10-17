---
name: protocolo-testing
description: Cómo correr y escribir tests en kinesiapp (unit, integración y aislamiento contra Postgres local). Usar al correr tests, al arreglar uno o al agregar tablas, políticas, servicios o Server Actions.
---

# Protocolo de testing

## Comandos
```bash
pnpm db:local:up        # Postgres 16 efímero en 127.0.0.1:54322 (sin Docker); idempotente
pnpm test               # unitarios, sin base
pnpm test:integration   # recrea kinesiapp_test (prepare-db), aplica migraciones y corre integración + aislamiento
pnpm test:isolation     # solo el test bloqueante de aislamiento
pnpm ci:local           # lo mismo que CI, en orden
```

## Reglas
- Dos conexiones con roles distintos (`tests/helpers/db.ts`): `adminSql()` (superusuario) SOLO siembra e inspecciona el catálogo; `appSql()` / `asApp()` corren como `kinesiapp_app`. Toda aserción de aislamiento va como la app: TurnoGol tuvo verdes falsos por testear como superusuario.
- `asApp` siempre revierte: los tests no dependen del orden.
- Errores esperados por SQLSTATE con `expectPgError` (42501 permiso/RLS, 23503 FK, 23514 check, P0001 regla de negocio con HINT).
- Política nueva → prueba de mutación: aflojarla a mano (`ALTER POLICY … USING (true)`) en la base de test y confirmar que el test se pone rojo; después `pnpm test:isolation` vuelve a verde.
- Server Action nueva: tiene que llamar a su guard (lo verifica `tests/unit/guard-chain.test.ts`).
- Al declarar verde, pegar la salida real del comando.
