import { describe, expect, it } from 'vitest'
import { sanitizeNext } from '@/lib/safe-redirect'

describe('sanitizeNext', () => {
  it.for([
    ['//evil.com', '/'],
    ['/\\evil.com', '/'],
    ['/\t/evil.com', '/'],
    ['https://evil.com', '/'],
    ['', '/'],
  ])('%s → %s', ([input, expected]) => {
    expect(sanitizeNext(input)).toBe(expected)
  })

  it('acepta rutas propias', () => {
    expect(sanitizeNext('/c/x/inicio')).toBe('/c/x/inicio')
  })

  it('un array (?next=a&next=b) cae al fallback', () => {
    expect(sanitizeNext(['/a', '/b'], '/inicio')).toBe('/inicio')
  })
})
