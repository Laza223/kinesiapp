-- Pacientes: versión mínima, SIN interfaz todavía.
--
-- Existe para probar el aislamiento entre consultorios con la tabla más sensible desde el
-- día cero. Los campos clínicos y administrativos (cobertura, contacto, etc.) se agregan
-- cuando las entrevistas digan cuáles hacen falta (docs/backlog.md).
-- Documento flexible a propósito: tipo + número en texto y opcional, para no excluir a
-- extranjeros ni a pacientes sin documento a mano.
-- Sin DELETE para nadie: la historia clínica se custodia ≥10 años (Ley 26.529, art. 18).

CREATE TYPE public.document_type AS ENUM ('dni', 'pasaporte', 'otro');

CREATE TABLE public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics (id),
  full_name text NOT NULL CHECK (char_length(btrim(full_name)) BETWEEN 1 AND 200),
  document_type public.document_type,
  document_number text CHECK (document_number ~ '^[A-Za-z0-9.\- ]{3,20}$'),
  created_by_member_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT patients_clinic_id_id_key UNIQUE (clinic_id, id),
  CONSTRAINT patients_document_pair CHECK ((document_type IS NULL) = (document_number IS NULL)),
  CONSTRAINT patients_created_by_member_fkey FOREIGN KEY (clinic_id, created_by_member_id)
    REFERENCES public.clinic_members (clinic_id, id)
);
CREATE UNIQUE INDEX patients_clinic_document_key ON public.patients (clinic_id, document_type, document_number)
  WHERE document_number IS NOT NULL;

CREATE TRIGGER patients_set_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients FORCE ROW LEVEL SECURITY;

CREATE POLICY patients_select ON public.patients FOR SELECT TO kinesiapp_app
  USING (clinic_id = (SELECT private.current_clinic_id())
         AND (SELECT private.has_clinic_role('{owner,professional,reception}')));
CREATE POLICY patients_insert ON public.patients FOR INSERT TO kinesiapp_app
  WITH CHECK (clinic_id = (SELECT private.current_clinic_id())
              AND created_by_member_id = (SELECT private.current_member_id())
              AND (SELECT private.has_clinic_role('{owner,professional,reception}')));
CREATE POLICY patients_update ON public.patients FOR UPDATE TO kinesiapp_app
  USING (clinic_id = (SELECT private.current_clinic_id())
         AND (SELECT private.has_clinic_role('{owner,professional,reception}')))
  WITH CHECK (clinic_id = (SELECT private.current_clinic_id())
              AND (SELECT private.has_clinic_role('{owner,professional,reception}')));

GRANT SELECT ON public.patients TO kinesiapp_app;
GRANT INSERT (clinic_id, full_name, document_type, document_number, created_by_member_id)
  ON public.patients TO kinesiapp_app;
GRANT UPDATE (full_name, document_type, document_number) ON public.patients TO kinesiapp_app;
