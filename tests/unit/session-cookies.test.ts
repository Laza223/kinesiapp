import { describe, expect, it, vi } from 'vitest'
import { SESSION_MAX_AGE_SECONDS, sessionCookieOptions } from '@/lib/supabase/cookie-options'

describe('opciones de la cookie de sesión', () => {
  it('12 h, httpOnly, lax', () => {
    expect(SESSION_MAX_AGE_SECONDS).toBe(43_200)
    expect(sessionCookieOptions()).toMatchObject({
      maxAge: 43_200,
      httpOnly: true,
      sameSite: 'lax',
    })
  })

  it('secure en producción', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(sessionCookieOptions().secure).toBe(true)
  })
})
