# Despliegue

> Ninguno de estos pasos se ejecutó todavía: no hay cuentas creadas. Los comandos contra entornos remotos los corre el founder; Claude los tiene denegados en `.claude/settings.json`.

## 0. Antes de crear nada

- **Región:** decidirla con el abogado ([D9](decisions/2026-10-16-arranque.md), [preguntas](legal/preguntas-abogado-y-contador.md)). La opción por defecto es Supabase São Paulo (`sa-east-1`) + Vercel `gru1`, con cláusulas modelo (Res. AAIP 198/2023). La alternativa es la UE, con más latencia. No se puede mover una base sin migrarla.
- **Entornos separados:** staging y producción en proyectos de Supabase distintos. Nunca compartir base, secretos ni usuarios con TurnoGol.
- **Plan:** para datos reales, Supabase Pro (backups diarios; evaluar PITR) y Vercel Pro (Hobby no permite uso comercial). Los backups de la base no incluyen Storage: cuando haya adjuntos, respaldar los dos y ensayar la restauración conjunta.

## 1. Supabase

1. Crear el proyecto en la región elegida. Postgres 16 o superior; alinear la imagen del job de integración de CI con la versión mayor del proyecto.
2. **Auth → Providers → Email:** confirmación obligatoria, contraseña mínima de 10 caracteres con letras y dígitos, protección de contraseñas filtradas activada.
3. **Auth → URL Configuration:** Site URL = dominio de la app; Redirect URLs = `https://<dominio>/auth/confirmar`.
4. **Auth → Email Templates → Confirm signup:** usar `supabase/templates/confirmation.html` (link a `/auth/confirmar?token_hash=…&type=signup`).
5. **Auth → Sessions:** rotación de refresh tokens activada (es el default).
6. **API → Data API:** sacar `public` de los schemas expuestos. La app no usa PostgREST.
7. **Aplicar migraciones** (founder):
   ```bash
   supabase link --project-ref <ref>
   supabase db push --dry-run    # revisar
   supabase db push
   ```
8. **Contraseñas de los roles** (SQL editor, nunca en git):
   ```sql
   ALTER ROLE kinesiapp_app LOGIN PASSWORD '<generada>';
   -- kinesiapp_worker queda NOLOGIN hasta que exista un job
   ```
9. **Verificaciones** (SQL editor):
   ```sql
   -- la app no saltea RLS ni es superusuario
   SELECT rolname, rolsuper, rolbypassrls FROM pg_roles WHERE rolname LIKE 'kinesiapp_%';
   -- las funciones SECURITY DEFINER necesitan que su dueño (postgres) tenga BYPASSRLS en Supabase
   SELECT rolbypassrls FROM pg_roles WHERE rolname = 'postgres';
   -- nada expuesto a anon/authenticated
   SELECT grantee, table_name FROM information_schema.role_table_grants
   WHERE table_schema = 'public' AND grantee IN ('anon', 'authenticated');
   ```
10. Revisar **Advisors** (seguridad y performance) y dejarlo en cero.

## 2. Vercel

1. Importar el repo; región de funciones = la de la base (`gru1` si es São Paulo).
2. Variables por entorno (Production y Preview **separadas**; TurnoGol tuvo Preview apuntando a la base de producción):
   - `DATABASE_URL`: pooler en modo transacción, puerto 6543, usuario `kinesiapp_app.<project-ref>`.
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
   - `NEXT_PUBLIC_APP_URL`.
3. Preview deployments: deshabilitados o con su propia base de staging. Nunca con la de producción.

## 3. GitHub

Protección de `main` con los cuatro checks requeridos: **Lint & Types**, **Unit tests**, **Integration & isolation** y **Secrets & dependencies**.

## 4. Smoke test después de cada despliegue

1. Registrarse con un email real → llega el mail → confirmar.
2. Ingresar → `/crear-consultorio` → crear → `/c/<id>/inicio` muestra el nombre y el rol "Dueño/a".
3. Cerrar sesión → `/c/<id>/inicio` redirige a `/ingresar`.
4. `curl -sI https://<dominio>/ingresar`: CSP con nonce, HSTS, `X-Frame-Options: DENY`, `x-request-id`.
5. Con un segundo usuario: abrir `/c/<id-del-primero>/inicio` → `/sin-acceso`.

## 5. Migraciones y compatibilidad

Las migraciones se aplican antes del deploy del código y tienen que ser compatibles con la versión anterior de la app: un rollback de Vercel no revierte una migración. Nunca editar una migración aplicada; siempre una nueva.
