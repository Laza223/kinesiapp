import { z } from 'zod'

/**
 * Variables de entorno del servidor. Se validan de forma perezosa (al crear el pool o el
 * cliente de Supabase) y no en `instrumentation.register()`: TurnoGol midió que en Vercel
 * ese hook no corre antes del primer request.
 */
const schema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
})

type ServerEnv = z.infer<typeof schema>

export function readServerEnv(env: Record<string, string | undefined> = process.env): ServerEnv {
  // "" cuenta como no configurada.
  const normalized = Object.fromEntries(Object.entries(env).filter(([, v]) => v !== ''))
  const parsed = schema.safeParse(normalized)
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
    throw new Error(`Entorno inválido: ${issues}`)
  }
  return parsed.data
}
