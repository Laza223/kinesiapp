-- Consultorios (tenant) y membresías con rol.
--
-- Regla para TODA tabla con clinic_id (checklist completo en .claude/rules/tablas-y-rls.md):
--   * UNIQUE (clinic_id, id) para poder referenciarla con FK compuesta.
--   * Toda referencia a otra fila del consultorio va por FK compuesta (clinic_id, x_id):
--     asociar registros de dos consultorios es imposible incluso por un camino BYPASSRLS.
--   * Nunca se otorga UPDATE sobre clinic_id.
--   * ENABLE + FORCE ROW LEVEL SECURITY y políticas solo TO kinesiapp_app.

CREATE TYPE public.clinic_status AS ENUM ('active', 'suspended', 'canceled');
CREATE TYPE public.clinic_role AS ENUM ('owner', 'professional', 'reception');
CREATE TYPE public.member_status AS ENUM ('active', 'inactive');

CREATE TABLE public.clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 2 AND 120 AND name = btrim(name)),
  status public.clinic_status NOT NULL DEFAULT 'active',
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX clinics_created_by_idx ON public.clinics (created_by);

-- user_id = auth.users.id (el `sub` del JWT), sin FK a propósito: las migraciones corren en
-- Postgres pelado y la autoría sobrevive aunque se borre el usuario de auth. Al staff se lo
-- desactiva, nunca se lo borra.
CREATE TABLE public.clinic_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics (id),
  user_id uuid NOT NULL,
  role public.clinic_role NOT NULL,
  status public.member_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT clinic_members_clinic_user_key UNIQUE (clinic_id, user_id),
  CONSTRAINT clinic_members_clinic_id_id_key UNIQUE (clinic_id, id)
);
CREATE INDEX clinic_members_user_id_idx ON public.clinic_members (user_id);

CREATE TRIGGER clinics_set_updated_at BEFORE UPDATE ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER clinic_members_set_updated_at BEFORE UPDATE ON public.clinic_members
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

-- ¿El usuario del contexto es miembro activo del consultorio del contexto, con alguno de
-- estos roles? SECURITY DEFINER para poder leer clinic_members desde su propia política sin
-- recursión infinita. Las políticas la llaman envuelta en (SELECT ...) para que Postgres la
-- evalúe una vez por sentencia y no una vez por fila.
CREATE FUNCTION private.has_clinic_role(roles public.clinic_role[]) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clinic_members m
    WHERE m.clinic_id = private.current_clinic_id()
      AND m.user_id = private.current_user_id()
      AND m.status = 'active'
      AND m.role = ANY (roles)
  )
$$;

-- Id de membresía del usuario del contexto en el consultorio del contexto (o NULL).
-- Sirve para que la autoría (created_by_member_id) no se pueda falsificar.
CREATE FUNCTION private.current_member_id() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT m.id FROM public.clinic_members m
  WHERE m.clinic_id = private.current_clinic_id()
    AND m.user_id = private.current_user_id()
    AND m.status = 'active'
$$;

GRANT EXECUTE ON FUNCTION private.has_clinic_role(public.clinic_role[]) TO kinesiapp_app;
GRANT EXECUTE ON FUNCTION private.current_member_id() TO kinesiapp_app;

-- Nunca un consultorio sin dueño activo. SECURITY DEFINER: cuenta todos los dueños sin
-- depender de lo que la política le deje ver al que actualiza; bloquea la fila del
-- consultorio para que dos degradaciones concurrentes no se pisen.
CREATE FUNCTION private.protect_last_owner() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  remaining integer;
BEGIN
  IF OLD.role = 'owner' AND OLD.status = 'active'
     AND (TG_OP = 'DELETE' OR NEW.role <> 'owner' OR NEW.status <> 'active') THEN
    PERFORM 1 FROM public.clinics c WHERE c.id = OLD.clinic_id FOR UPDATE;
    SELECT count(*) INTO remaining FROM public.clinic_members m
    WHERE m.clinic_id = OLD.clinic_id AND m.role = 'owner' AND m.status = 'active' AND m.id <> OLD.id;
    IF remaining = 0 THEN
      RAISE EXCEPTION 'El consultorio no puede quedarse sin dueño activo'
        USING ERRCODE = 'P0001', HINT = 'last_owner';
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER clinic_members_protect_last_owner BEFORE UPDATE OR DELETE ON public.clinic_members
  FOR EACH ROW EXECUTE FUNCTION private.protect_last_owner();

ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics FORCE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_members FORCE ROW LEVEL SECURITY;

CREATE POLICY clinics_select ON public.clinics FOR SELECT TO kinesiapp_app
  USING (id = (SELECT private.current_clinic_id())
         AND (SELECT private.has_clinic_role('{owner,professional,reception}')));
CREATE POLICY clinics_update ON public.clinics FOR UPDATE TO kinesiapp_app
  USING (id = (SELECT private.current_clinic_id()) AND (SELECT private.has_clinic_role('{owner}')))
  WITH CHECK (id = (SELECT private.current_clinic_id()) AND (SELECT private.has_clinic_role('{owner}')));

CREATE POLICY clinic_members_select ON public.clinic_members FOR SELECT TO kinesiapp_app
  USING (clinic_id = (SELECT private.current_clinic_id())
         AND (SELECT private.has_clinic_role('{owner,professional,reception}')));
CREATE POLICY clinic_members_update ON public.clinic_members FOR UPDATE TO kinesiapp_app
  USING (clinic_id = (SELECT private.current_clinic_id()) AND (SELECT private.has_clinic_role('{owner}')))
  WITH CHECK (clinic_id = (SELECT private.current_clinic_id()) AND (SELECT private.has_clinic_role('{owner}')));

-- Grants explícitos por columna. Sin INSERT ni DELETE: consultorios y membresías nacen solo
-- por funciones SECURITY DEFINER (private.create_clinic) y nunca se borran.
GRANT SELECT ON public.clinics TO kinesiapp_app;
GRANT UPDATE (name) ON public.clinics TO kinesiapp_app;
GRANT SELECT ON public.clinic_members TO kinesiapp_app;
GRANT UPDATE (role, status) ON public.clinic_members TO kinesiapp_app;
