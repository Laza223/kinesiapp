-- Registro de auditoría append-only.
--
-- Qué va acá: QUIÉN hizo QUÉ sobre QUÉ entidad y CUÁNDO. Qué NO va: el contenido.
-- `metadata` nunca lleva datos de salud ni copias antes/después de una fila (eso duplicaría
-- la historia clínica en otro lado); tope de 2 KB como freno estructural.

CREATE TABLE public.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics (id),
  actor_user_id uuid NOT NULL,
  action text NOT NULL CHECK (action ~ '^[a-z_]+\.[a-z_]+$'),
  entity_type text NOT NULL CHECK (entity_type ~ '^[a-z_]+$'),
  entity_id uuid,
  request_id text CHECK (char_length(request_id) <= 64),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(metadata) = 'object' AND pg_column_size(metadata) <= 2048),
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_events_clinic_occurred_idx ON public.audit_events (clinic_id, occurred_at DESC);

-- Los triggers atan también al dueño de la tabla: append-only no depende solo de los grants.
CREATE TRIGGER audit_events_no_update BEFORE UPDATE OR DELETE ON public.audit_events
  FOR EACH ROW EXECUTE FUNCTION private.forbid_mutation();
CREATE TRIGGER audit_events_no_truncate BEFORE TRUNCATE ON public.audit_events
  FOR EACH STATEMENT EXECUTE FUNCTION private.forbid_mutation();

ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events FORCE ROW LEVEL SECURITY;

-- Lee solo el dueño. Ojo: como recepción no pasa el SELECT, un INSERT ... RETURNING suyo
-- falla. La app inserta auditoría siempre sin RETURNING.
CREATE POLICY audit_events_select ON public.audit_events FOR SELECT TO kinesiapp_app
  USING (clinic_id = (SELECT private.current_clinic_id()) AND (SELECT private.has_clinic_role('{owner}')));
CREATE POLICY audit_events_insert ON public.audit_events FOR INSERT TO kinesiapp_app
  WITH CHECK (clinic_id = (SELECT private.current_clinic_id())
              AND actor_user_id = (SELECT private.current_user_id())
              AND (SELECT private.has_clinic_role('{owner,professional,reception}')));

-- Sin id ni occurred_at en el INSERT: la app no puede fechar hacia atrás.
GRANT SELECT ON public.audit_events TO kinesiapp_app;
GRANT INSERT (clinic_id, actor_user_id, action, entity_type, entity_id, request_id, metadata)
  ON public.audit_events TO kinesiapp_app;
