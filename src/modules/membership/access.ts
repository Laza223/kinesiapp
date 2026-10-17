import type { ClinicRole } from './roles'
import type { ActiveMembership, MyMembership } from './membership.service'

export type AccessDenial = 'NOT_MEMBER' | 'FORBIDDEN' | 'CLINIC_INACTIVE'

/** Decisión pura de acceso a un consultorio (testeada en tests/unit/access.test.ts). */
export function decideClinicAccess(
  membership: ActiveMembership | null,
  allowed: readonly ClinicRole[],
): { ok: true; membership: ActiveMembership } | { ok: false; reason: AccessDenial } {
  if (!membership) return { ok: false, reason: 'NOT_MEMBER' }
  if (membership.clinicStatus !== 'active') return { ok: false, reason: 'CLINIC_INACTIVE' }
  if (!allowed.includes(membership.role)) return { ok: false, reason: 'FORBIDDEN' }
  return { ok: true, membership }
}

/** A dónde va alguien recién logueado: 0 consultorios → crear; 1 → ese; N → elegir. */
export function homePathFor(memberships: readonly MyMembership[]): string {
  if (memberships.length === 0) return '/crear-consultorio'
  if (memberships.length === 1) return `/c/${memberships[0]!.clinicId}/inicio`
  return '/consultorios'
}
