import Link from 'next/link'
import { AuthCard } from '@/components/auth-card'
import { listMyMemberships } from '@/modules/membership/membership.service'
import { ROLE_LABELS } from '@/modules/membership/roles'
import { requireUser } from '@/server/guards'

export default async function ConsultoriosPage() {
  const user = await requireUser()
  const memberships = await listMyMemberships(user.userId)
  return (
    <AuthCard title="Elegí un consultorio">
      <ul className="flex flex-col divide-y divide-[var(--color-line)] rounded border border-[var(--color-line)]">
        {memberships.map((m) => (
          <li key={m.clinicId}>
            <Link href={`/c/${m.clinicId}/inicio`} className="flex justify-between px-3 py-2">
              <span>{m.clinicName}</span>
              <span className="text-sm text-[var(--color-muted)]">{ROLE_LABELS[m.role]}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/crear-consultorio" className="text-sm underline">
        Crear otro consultorio
      </Link>
    </AuthCard>
  )
}
