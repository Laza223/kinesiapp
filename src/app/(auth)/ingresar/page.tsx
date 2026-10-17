import Link from 'next/link'
import { AuthCard } from '@/components/auth-card'
import { LoginForm } from './login-form'

export default function IngresarPage() {
  return (
    <AuthCard title="Ingresar a kinesiapp">
      <LoginForm />
      <p className="text-sm text-[var(--color-muted)]">
        ¿No tenés cuenta?{' '}
        <Link href="/registro" className="underline">
          Registrate
        </Link>
      </p>
    </AuthCard>
  )
}
