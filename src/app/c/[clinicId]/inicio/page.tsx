import { requireRole } from '@/server/guards'

export default async function InicioPage({ params }: { params: Promise<{ clinicId: string }> }) {
  const { clinicId } = await params
  // El layout ya verificó, pero cada página llama a su guard: los layouts no protegen todo
  // (p. ej. no corren para las Server Actions) y la regla es una sola.
  const session = await requireRole(clinicId)
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-lg font-semibold">Inicio</h1>
      <p className="mt-2 text-[var(--color-muted)]">
        {session.clinicName} está listo. Los módulos de pacientes, agenda e historia clínica se
        suman cuando las entrevistas con kinesiólogos definan por dónde empezar.
      </p>
    </main>
  )
}
