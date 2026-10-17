import Link from 'next/link'
import { AuthCard } from '@/components/auth-card'

const MESSAGES: Record<string, string> = {
  NOT_MEMBER: 'No tenés acceso a este consultorio.',
  FORBIDDEN: 'Tu rol no permite ver esta sección.',
  CLINIC_INACTIVE: 'Este consultorio no está activo.',
}

export default async function SinAccesoPage({
  searchParams,
}: {
  searchParams: Promise<{ motivo?: string | string[] }>
}) {
  const { motivo } = await searchParams
  const message = (typeof motivo === 'string' && MESSAGES[motivo]) || MESSAGES.NOT_MEMBER
  return (
    <AuthCard title="Sin acceso">
      <p>{message}</p>
      <Link href="/" className="text-sm underline">
        Volver al inicio
      </Link>
    </AuthCard>
  )
}
