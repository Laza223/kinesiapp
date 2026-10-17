import { AuthCard } from '@/components/auth-card'
import { requireUser } from '@/server/guards'
import { CreateClinicForm } from './create-clinic-form'

export default async function CrearConsultorioPage() {
  await requireUser()
  return (
    <AuthCard title="Creá tu consultorio">
      <p className="text-sm text-[var(--color-muted)]">
        Vas a quedar como dueño/a. Después vas a poder sumar a tu equipo.
      </p>
      <CreateClinicForm />
    </AuthCard>
  )
}
