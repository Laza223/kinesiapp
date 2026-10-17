import { describe, expect, it } from 'vitest'
import { decideClinicAccess, homePathFor } from '@/modules/membership/access'
import type { ActiveMembership, MyMembership } from '@/modules/membership/membership.service'

const member = (over: Partial<ActiveMembership> = {}): ActiveMembership => ({
  memberId: 'm1',
  role: 'reception',
  clinicName: 'Kine',
  clinicStatus: 'active',
  ...over,
})

describe('decideClinicAccess', () => {
  it('sin membresía: NOT_MEMBER', () => {
    expect(decideClinicAccess(null, ['owner'])).toEqual({ ok: false, reason: 'NOT_MEMBER' })
  })
  it('consultorio suspendido: CLINIC_INACTIVE aunque el rol alcance', () => {
    expect(decideClinicAccess(member({ clinicStatus: 'suspended' }), ['reception'])).toEqual({
      ok: false,
      reason: 'CLINIC_INACTIVE',
    })
  })
  it('rol no permitido: FORBIDDEN', () => {
    expect(decideClinicAccess(member(), ['owner', 'professional'])).toEqual({
      ok: false,
      reason: 'FORBIDDEN',
    })
  })
  it('rol permitido: ok', () => {
    expect(decideClinicAccess(member(), ['reception']).ok).toBe(true)
  })
})

describe('homePathFor', () => {
  const m = (id: string): MyMembership => ({
    clinicId: id,
    clinicName: id,
    clinicStatus: 'active',
    role: 'owner',
  })
  it('0 → crear, 1 → ese consultorio, N → elegir', () => {
    expect(homePathFor([])).toBe('/crear-consultorio')
    expect(homePathFor([m('a')])).toBe('/c/a/inicio')
    expect(homePathFor([m('a'), m('b')])).toBe('/consultorios')
  })
})
