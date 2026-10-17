-- Alta de consultorio y listado de membresías propias.
-- Son los dos únicos caminos que cruzan consultorios, y por eso viven en funciones
-- SECURITY DEFINER acotadas al usuario del contexto, en vez de abrir políticas.

-- Consultorios del usuario del contexto (solo los suyos), para el selector y el ruteo.
CREATE FUNCTION private.my_memberships()
RETURNS TABLE (clinic_id uuid, clinic_name text, clinic_status public.clinic_status, role public.clinic_role)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT c.id, c.name, c.status, m.role
  FROM public.clinic_members m
  JOIN public.clinics c ON c.id = m.clinic_id
  WHERE m.user_id = private.current_user_id() AND m.status = 'active'
  ORDER BY c.name, c.id
$$;

-- Crea consultorio + membresía de dueño + evento de auditoría en un solo paso.
-- Tope de 5 consultorios creados por usuario: freno barato contra abuso del alta.
CREATE FUNCTION private.create_clinic(p_name text, p_request_id text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_user uuid := private.current_user_id();
  v_clinic uuid;
  v_created integer;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Falta el usuario del contexto' USING ERRCODE = '42501';
  END IF;
  SELECT count(*) INTO v_created FROM public.clinics c WHERE c.created_by = v_user;
  IF v_created >= 5 THEN
    RAISE EXCEPTION 'Límite de consultorios creados alcanzado'
      USING ERRCODE = 'P0001', HINT = 'clinic_limit';
  END IF;

  INSERT INTO public.clinics (name, created_by) VALUES (btrim(p_name), v_user)
  RETURNING id INTO v_clinic;
  INSERT INTO public.clinic_members (clinic_id, user_id, role) VALUES (v_clinic, v_user, 'owner');
  INSERT INTO public.audit_events (clinic_id, actor_user_id, action, entity_type, entity_id, request_id)
  VALUES (v_clinic, v_user, 'clinic.created', 'clinic', v_clinic, p_request_id);
  RETURN v_clinic;
END $$;

GRANT EXECUTE ON FUNCTION private.my_memberships() TO kinesiapp_app;
GRANT EXECUTE ON FUNCTION private.create_clinic(text, text) TO kinesiapp_app;
