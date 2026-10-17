import { describe, expect, it } from 'vitest'
import { buildCsp, STATIC_SECURITY_HEADERS } from '@/lib/security-headers'

describe('headers de seguridad', () => {
  it('la CSP de producción no permite eval', () => {
    expect(buildCsp('n0nce', false)).not.toContain('unsafe-eval')
    expect(buildCsp('n0nce', false)).toContain('upgrade-insecure-requests')
  })

  it('incluye los headers fijos esperados', () => {
    const keys = STATIC_SECURITY_HEADERS.map((h) => h.key)
    expect(keys).toEqual(
      expect.arrayContaining([
        'Strict-Transport-Security',
        'X-Content-Type-Options',
        'X-Frame-Options',
        'Referrer-Policy',
        'X-Robots-Tag',
      ]),
    )
  })
})
