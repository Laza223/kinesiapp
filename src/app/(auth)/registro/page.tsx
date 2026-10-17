import Link from 'next/link'
import { AuthCard } from '@/components/auth-card'
import { SignupForm } from './signup-form'

export default function RegistroPage() {
  return (
    <AuthCard title="Crear cuenta">
      <SignupForm />
      <p className="text-sm text-[var(--color-muted)]">
        ¿Ya tenés cuenta?{' '}
        <Link href="/ingresar" className="underline">
          Ingresá
        </Link>
      </p>
    </AuthCard>
  )
}
