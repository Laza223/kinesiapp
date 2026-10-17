import { z } from 'zod'

// Espejo de `minimum_password_length` en supabase/config.toml (un test los ata).
export const MIN_PASSWORD_LENGTH = 10

export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(MIN_PASSWORD_LENGTH),
})
