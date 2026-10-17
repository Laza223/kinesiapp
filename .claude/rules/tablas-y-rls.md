---
paths:
  - "src/shared/db/**"
  - "supabase/migrations/**"
  - "tests/integration/**"
---

# Tablas y RLS: checklist obligatorio

Inventario actual: `clinics`, `clinic_members`, `audit_events`, `patients` (canario, sin UI). Todas con `clinic_id` (o `id` en `clinics`), RLS + FORCE, políticas solo `TO kinesiapp_app`.

## Tabla nueva con datos de un consultorio

1. Migración NUEVA en `supabase/migrations/AAAAMMDDNNNNNN_nombre.sql`. Nunca editar una migración ya aplicada en algún entorno.
2. `clinic_id uuid NOT NULL REFERENCES clinics(id)` + `UNIQUE (clinic_id, id)`.
3. Toda referencia a otra fila del consultorio: FK compuesta `(clinic_id, x_id)`. Nunca FK simple a `x.id`.
4. `ENABLE` + `FORCE ROW LEVEL SECURITY` en el mismo archivo (lo exige `tests/unit/migrations-lint.test.ts`).
5. Políticas por comando, `TO kinesiapp_app`, con el patrón:
   `clinic_id = (SELECT private.current_clinic_id()) AND (SELECT private.has_clinic_role('{...}'))`.
   Datos clínicos (evoluciones, evaluaciones, adjuntos): **sin `reception`**.
6. Autoría: columna `created_by_member_id` + `WITH CHECK (created_by_member_id = (SELECT private.current_member_id()))`.
7. Grants explícitos por columna. Nunca `UPDATE` sobre `clinic_id`. `DELETE` solo si la fila no es historia clínica (la historia se corrige con versiones, no se borra).
8. `updated_at` por trigger `private.set_updated_at()`.
9. Declarar la tabla en `CLINIC_SCOPED` y su matriz en `APP_PRIVILEGES` (`tests/integration/roles-and-privileges.test.ts`), sumarla a `TABLES` en `isolation.test.ts` y a `src/shared/db/schema/tables.ts`.
10. Correr `pnpm test:integration`. Para una política nueva, hacer la prueba de mutación (ver `docs/architecture.md`).

## Funciones SECURITY DEFINER

Solo en `private`, con `SET search_path = ''`, nombres calificados (`public.tabla`), acotadas al usuario del contexto, y `GRANT EXECUTE ... TO kinesiapp_app` explícito (el default de EXECUTE a PUBLIC ya está revocado en la migración 0001).
