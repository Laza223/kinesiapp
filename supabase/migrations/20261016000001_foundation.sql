-- Fundación: roles de base de datos, schema privado y helpers de contexto.
--
-- Modelo de seguridad (detalle en docs/architecture.md):
--   * La web se conecta como `kinesiapp_app`: sin BYPASSRLS, sujeto a RLS en todas las tablas.
--   * `kinesiapp_worker` (BYPASSRLS) queda reservado para procesos de fondo; hoy no tiene grants.
--   * El contexto de cada request viaja en dos GUC transaccionales (set_config(..., true)):
--     app.current_clinic_id y app.current_user_id. Las políticas además verifican la membresía
--     en SQL, así que un GUC falsificado no alcanza para ver datos.
--   * Las contraseñas de los roles NUNCA van en una migración: se setean a mano por entorno.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'kinesiapp_app') THEN
    CREATE ROLE kinesiapp_app NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'kinesiapp_worker') THEN
    CREATE ROLE kinesiapp_worker NOLOGIN BYPASSRLS;
  END IF;
END $$;

-- Timeouts por rol. Aplican al hacer LOGIN con el rol (no con SET ROLE).
-- Regla del repo: nunca una llamada externa dentro de una transacción; con estos topes,
-- una transacción olvidada abierta muere sola en vez de retener locks.
ALTER ROLE kinesiapp_app SET statement_timeout = '15s';
ALTER ROLE kinesiapp_app SET lock_timeout = '3s';
ALTER ROLE kinesiapp_app SET idle_in_transaction_session_timeout = '30s';
ALTER ROLE kinesiapp_worker SET statement_timeout = '120s';
ALTER ROLE kinesiapp_worker SET lock_timeout = '10s';
ALTER ROLE kinesiapp_worker SET idle_in_transaction_session_timeout = '120s';

-- Supabase otorga por defecto todo lo nuevo de `public` a anon/authenticated/service_role
-- (la Data API). Esta app no usa la Data API: se neutraliza antes de crear tablas.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated, service_role';
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated, service_role';
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated, service_role';
  END IF;
END $$;
-- Postgres otorga EXECUTE a PUBLIC en toda función nueva, y ese default NO se puede revocar
-- por schema (`IN SCHEMA` solo agrega): se revoca a nivel global para el rol que migra.
-- Medido: con la versión por schema, las 9 funciones de `private` quedaban ejecutables por PUBLIC.
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

GRANT USAGE ON SCHEMA public TO kinesiapp_app;

-- Schema `private`: helpers y funciones SECURITY DEFINER. No se expone en la Data API.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO kinesiapp_app, kinesiapp_worker;

CREATE FUNCTION private.current_clinic_id() RETURNS uuid
LANGUAGE sql STABLE SET search_path = '' AS $$
  SELECT nullif(current_setting('app.current_clinic_id', true), '')::uuid
$$;

CREATE FUNCTION private.current_user_id() RETURNS uuid
LANGUAGE sql STABLE SET search_path = '' AS $$
  SELECT nullif(current_setting('app.current_user_id', true), '')::uuid
$$;

GRANT EXECUTE ON FUNCTION private.current_clinic_id() TO kinesiapp_app;
GRANT EXECUTE ON FUNCTION private.current_user_id() TO kinesiapp_app;

-- updated_at lo pone siempre la base: con grants por columna, la app no puede escribirlo.
CREATE FUNCTION private.set_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END $$;

-- Tablas append-only: ni la app ni el dueño de la tabla pueden modificar ni borrar.
CREATE FUNCTION private.forbid_mutation() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  RAISE EXCEPTION '% no permitido en %: la tabla es append-only', TG_OP, TG_TABLE_NAME
    USING ERRCODE = '42501';
END $$;
