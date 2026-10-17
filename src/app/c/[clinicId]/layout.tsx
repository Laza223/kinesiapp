import Link from 'next/link'
import { ROLE_LABELS } from '@/modules/membership/roles'
import { requireRole } from '@/server/guards'
import { SignOutButton } from './sign-out-button'

export default async function ClinicLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ clinicId: string }>
}) {
  const { clinicId } = await params
  const session = await requireRole(clinicId)
  return (
    <div className="min-h-dvh">
      <header className="flex items-center justify-between border-b border-[var(--color-line)] px-4 py-3">
        <Link href={`/c/${clinicId}/inicio`} className="font-semibold">
          {session.clinicName}
        </Link>
        <div className="flex items-center gap-4 text-sm text-[var(--color-muted)]">
          <span>{ROLE_LABELS[session.role]}</span>
          <SignOutButton />
        </div>
      </header>
      {children}
    </div>
  )
}
