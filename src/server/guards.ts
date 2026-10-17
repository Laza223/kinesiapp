import { redirect } from 'next/navigation'
import { getAuthUser, type AuthUser } from '@/modules/auth/session'
import { decideClinicAccess, type AccessDenial } from '@/modules/membership/access'
import { getActiveMembership } from '@/modules/membership/membership.service'
import { CLINIC_ROLES, type ClinicRole } from '@/modules/membership/roles'
import { withClinicContext } from '@/shared/db/client'

/**
 * Guards: la ÚNICA puerta de páginas y Server Actions. Cada Server Action llama al suyo
 * (los layouts no corren para las acciones); tests/unit/guard-chain.test.ts lo exige.
 *
 * El clinicId llega en la URL (/c/[clinicId]/…) y es solo una pista: se re-verifica contra la
 * base en cada request, bajo RLS. Así un kinesiólogo que trabaja en dos consultorios puede
 * tener una pestaña de cada uno sin escribir en el equivocado.
 */

export type ClinicSession = AuthUser & {
  clinicId: string
  clinicName: string
  memberId: string
  role: ClinicRole
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function resolveClinicSession(
  user: AuthUser,
  clinicId: string,
  allowed: readonly ClinicRole[],
): Promise<{ ok: true; session: ClinicSession } | { ok: false; reason: AccessDenial }> {
  if (!UUID_RE.test(clinicId)) return { ok: false, reason: 'NOT_MEMBER' }
  const membership = await withClinicContext({ clinicId, userId: user.userId }, getActiveMembership)
  const decision = decideClinicAccess(membership, allowed)
  if (!decision.ok) return decision
  const m = decision.membership
  return {
    ok: true,
    session: { ...user, clinicId, clinicName: m.clinicName, memberId: m.memberId, role: m.role },
  }
}

/** Páginas: usuario logueado o redirect a /ingresar. */
export async function requireUser(): Promise<AuthUser> {
  const user = await getAuthUser()
  if (!user) redirect('/ingresar')
  return user
}

/** Páginas de un consultorio: miembro activo con alguno de los roles, o redirect. */
export async function requireRole(
  clinicId: string,
  allowed: readonly ClinicRole[] = CLINIC_ROLES,
): Promise<ClinicSession> {
  const user = await requireUser()
  const result = await resolveClinicSession(user, clinicId, allowed)
  if (!result.ok) redirect(`/sin-acceso?motivo=${result.reason}`)
  return result.session
}

type ActionDenial = { ok: false; code: 'AUTH_REQUIRED' | AccessDenial; message: string }

const DENIAL_MESSAGES: Record<ActionDenial['code'], string> = {
  AUTH_REQUIRED: 'Tu sesión venció. Volvé a ingresar.',
  NOT_MEMBER: 'No tenés acceso a este consultorio.',
  FORBIDDEN: 'Tu rol no permite esta acción.',
  CLINIC_INACTIVE: 'El consultorio no está activo.',
}

/** Server Actions que solo necesitan un usuario (crear consultorio, cerrar sesión). */
export async function authorizeUserAction(): Promise<{ ok: true; user: AuthUser } | ActionDenial> {
  const user = await getAuthUser()
  if (!user) return { ok: false, code: 'AUTH_REQUIRED', message: DENIAL_MESSAGES.AUTH_REQUIRED }
  return { ok: true, user }
}

/**
 * Server Actions de un consultorio: nunca redirige, devuelve el motivo.
 * @public Sin consumidor todavía: la primera acción de consultorio son las invitaciones
 * (semana 1). Se deja hecha y testeada para que nadie escriba una acción sin guard.
 */
export async function authorizeAction(
  clinicId: string,
  allowed: readonly ClinicRole[],
): Promise<{ ok: true; session: ClinicSession } | ActionDenial> {
  const auth = await authorizeUserAction()
  if (!auth.ok) return auth
  const result = await resolveClinicSession(auth.user, clinicId, allowed)
  if (!result.ok) return { ok: false, code: result.reason, message: DENIAL_MESSAGES[result.reason] }
  return result
}
